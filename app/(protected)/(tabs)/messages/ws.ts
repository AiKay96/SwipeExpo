import { getStoredToken } from "./auth-storage";
import { API_URL } from "./config";

type Listener = (evt: any) => void;

class MessengerWS {
  private ws: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private reconnectDelay = 1000;
  private closedByUser = false;
  private pending: string[] = [];

  async connect() {
    this.closedByUser = false;

    // Turn http(s)://host into ws(s)://host and add /ws
    const httpUrl = new URL(API_URL);
    const wsUrl = new URL(httpUrl.toString().replace(/^http/, "ws"));
    wsUrl.pathname = "/ws";

    const token = await getStoredToken();
    if (token) wsUrl.searchParams.set("token", token);

    this.open(wsUrl.toString(), token ? [token] : []);
  }

  private open(url: string, protocols: string[] = []) {
    try {
      this.ws = new WebSocket(url, protocols);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectDelay = 1000;
      this.flushQueue();
      this.emit({ type: "ws.open" });
    };

    this.ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        this.emit(data);
      } catch {
        // ignore JSON parse errors
      }
    };

    this.ws.onerror = () => {
      // optional: emit({ type: 'ws.error' })
    };

    this.ws.onclose = () => {
      this.ws = null;
      this.emit({ type: "ws.close" });
      if (!this.closedByUser) this.scheduleReconnect();
    };
  }

  private flushQueue() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    while (this.pending.length) {
      this.ws.send(this.pending.shift()!);
    }
  }

  private scheduleReconnect() {
    setTimeout(() => {
      if (!this.closedByUser) this.connect();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 8000);
  }

  private emit(evt: any) {
    this.listeners.forEach((fn) => fn(evt));
  }

  close() {
    this.closedByUser = true;
    try { this.ws?.close(); } catch {}
    this.ws = null;
  }

  on(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  get isOpen() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  sendMessage(peer_id: string, body: string) {
    const payload = JSON.stringify({ type: "message.send", peer_id, body });
    if (this.isOpen) {
      try {
        this.ws!.send(payload);
        return true;
      } catch {
        // fall through to queue
      }
    }
    this.pending.push(payload);
    return false; // indicates queued/not sent immediately
  }
}

export const messengerWS = new MessengerWS();
