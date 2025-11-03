import type { CellOutput } from '../store/notebookStore';

export class KernelWebSocket {
  private ws: WebSocket | null = null;
  private messageCallbacks: Map<string, (data: any) => void> = new Map();
  private outputCallback: ((output: CellOutput) => void) | null = null;
  private kernelId: string;
  private wsUrl: string;

  constructor(kernelId: string, wsUrl: string) {
    this.kernelId = kernelId;
    this.wsUrl = wsUrl;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          resolve();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed');
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data);
      const msgType = message.msg_type;

      // Handle different message types
      if (msgType === 'stream') {
        // Standard output (print statements)
        if (this.outputCallback) {
          this.outputCallback({
            type: 'stream',
            text: message.content.text,
            name: message.content.name,
          });
        }
      } else if (msgType === 'execute_result' || msgType === 'display_data') {
        // Execution results (return values, plots, etc.)
        if (this.outputCallback) {
          this.outputCallback({
            type: msgType,
            data: message.content.data,
          });
        }
      } else if (msgType === 'error') {
        // Errors
        if (this.outputCallback) {
          this.outputCallback({
            type: 'error',
            text: message.content.traceback?.join('\n') || message.content.evalue,
          });
        }
      }

      // Call registered callbacks for specific message IDs
      const msgId = message.parent_header?.msg_id;
      if (msgId && this.messageCallbacks.has(msgId)) {
        const callback = this.messageCallbacks.get(msgId);
        callback?.(message);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  executeCode(code: string): string {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const msgId = this.generateMessageId();
    const message = {
      header: {
        msg_id: msgId,
        username: 'user',
        session: this.generateSessionId(),
        msg_type: 'execute_request',
        version: '5.3',
      },
      parent_header: {},
      metadata: {},
      content: {
        code: code,
        silent: false,
        store_history: true,
        user_expressions: {},
        allow_stdin: false,
        stop_on_error: false,
      },
      channel: 'shell',
    };

    this.ws.send(JSON.stringify(message));
    return msgId;
  }

  onOutput(callback: (output: CellOutput) => void) {
    this.outputCallback = callback;
  }

  registerCallback(msgId: string, callback: (data: any) => void) {
    this.messageCallbacks.set(msgId, callback);
  }

  unregisterCallback(msgId: string) {
    this.messageCallbacks.delete(msgId);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageCallbacks.clear();
    this.outputCallback = null;
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
