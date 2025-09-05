import { getStoredToken } from "./auth-storage";
import { API_URL } from "./config";

export type UUID = string;

export type InboxItem = {
  chat_id: UUID;
  peer_id: UUID;
  last_message_at: string | null;
  last_message_id: UUID | null;
  last_body: string | null;
  unread_count: number;
};

export type MessageItem = {
  id: UUID;
  chat_id: UUID;
  sender_id: UUID;
  body: string;
  created_at: string; // ISO
};

export type UserDto = {
  id: UUID;
  username: string;
  display_name?: string | null;
  profile_photo?: string | null;
};

async function authFetch(path: string, init: RequestInit = {}) {
  const token = await getStoredToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${API_URL}${path}`, { ...init, headers });
}

export async function getUserByUsername(username: string): Promise<UserDto> {
  const res = await authFetch(`/users/${encodeURIComponent(username)}`, { method: "GET" });
  if (!res.ok) throw new Error(`Failed to load user: ${res.status}`);
  return res.json();
}

export async function getInbox(limit = 30) {
  const res = await authFetch(`/inbox?limit=${limit}`, { method: "GET" });
  if (!res.ok) throw new Error(`Failed to load inbox: ${res.status}`);
  const json = await res.json();
  return json.chats as InboxItem[];
}

export async function getMessages(params: {
  peer_id?: UUID;
  chat_id?: UUID;
  limit?: number;
  before?: string;
}) {
  const qs = new URLSearchParams();
  if (params.peer_id) qs.set("peer_id", params.peer_id);
  if (params.chat_id) qs.set("chat_id", params.chat_id);
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.before) qs.set("before", params.before);
  const res = await authFetch(`/messages?${qs.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error(`Failed to load messages: ${res.status}`);
  const json = await res.json();
  return json.messages as MessageItem[];
}

export async function sendMessageRest(peer_id: UUID, body: string) {
  // If your backend expects chat_id, change this line accordingly
  const res = await authFetch(`/messages/send`, {
    method: "POST",
    body: JSON.stringify({ peer_id, body }),
  });
  if (!res.ok) throw new Error(`Failed to send message: ${res.status}`);
  const json = await res.json();
  return json.message as MessageItem;
}
