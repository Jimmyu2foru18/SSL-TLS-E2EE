import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CVTIdentity {
  phoneNumber: string;
  publicKey: string;
  privateKey: string; // Exported JWK or Hex
  keyFingerprint: string;
  createdAt: number;
  verified: boolean;
  hardwareBackend: "SecureEnclave" | "StrongBox" | "Software";
}

export interface CVTContact {
  id: string;
  name: string;
  phoneNumber: string;
  publicKey: string;
  keyFingerprint: string;
  hashedPhone: string;
  trustState: "verified" | "pending" | "rejected";
  lastSeen: number;
  avatar?: string;
}

export interface CVTMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  encryptedPayload: string;
  signature: string;
  timestamp: number;
  status: "sent" | "delivered" | "verified" | "rejected";
  isSpam: boolean;
  isOwn: boolean;
}

export interface RelayPacket {
  id: string;
  timestamp: number;
  from: string;
  to: string;
  signatureValid: boolean;
  rejected: boolean;
  reason?: string;
}

// ─── Cryptography Utilities (Production Grade) ───────────────────────────────

/**
 * Converts ArrayBuffer to Hex string for storage/display
 */
const bufToHex = (buf: ArrayBuffer): string => 
  Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');

/**
 * Converts Hex string to Uint8Array for crypto operations
 */
const hexToBuf = (hex: string): Uint8Array => {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) arr[i / 2] = parseInt(hex.substr(i, 2), 16);
  return arr;
};

export async function generateEd25519KeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: "Ed25519" },
    true, 
    ["sign", "verify"]
  );

  const pubRaw = await window.crypto.subtle.exportKey("raw", keyPair.publicKey);
  const privRaw = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  
  const publicKeyHex = bufToHex(pubRaw);
  const fingerprint = publicKeyHex.match(/.{1,8}/g)?.join(':') || "";

  return {
    publicKey: publicKeyHex,
    privateKey: bufToHex(privRaw),
    fingerprint
  };
}

export async function signMessage(message: string, privateKeyHex: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyBuf = hexToBuf(privateKeyHex);
  
  const key = await window.crypto.subtle.importKey(
    "pkcs8",
    keyBuf,
    { name: "Ed25519" },
    false,
    ["sign"]
  );

  const sig = await window.crypto.subtle.sign({ name: "Ed25519" }, key, encoder.encode(message));
  return bufToHex(sig);
}

export async function verifySignature(message: string, signatureHex: string, publicKeyHex: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
      "raw",
      hexToBuf(publicKeyHex),
      { name: "Ed25519" },
      false,
      ["verify"]
    );
    return await window.crypto.subtle.verify({ name: "Ed25519" }, key, hexToBuf(signatureHex), encoder.encode(message));
  } catch {
    return false;
  }
}

/**
 * Real AES-GCM Encryption 
 * (In production, use ECDH to derive a shared secret from recipientPublicKey)
 */
export async function encryptMessage(plaintext: string, sharedSecretHex: string): Promise<string> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  
  const key = await window.crypto.subtle.importKey(
    "raw",
    hexToBuf(sharedSecretHex).slice(0, 32), // Ensure 256-bit
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext)
  );

  return `aes-gcm:${bufToHex(iv)}:${bufToHex(encrypted)}`;
}

// ─── Store Logic ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "cvt-identity-v1";

let globalIdentity: CVTIdentity | null = null;
let globalMessages: CVTMessage[] = [];
let globalContacts: CVTContact[] = [];
let globalRelayLog: RelayPacket[] = [];
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach(fn => fn());
}

// Initial Sync from Storage
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) globalIdentity = JSON.parse(stored);
} catch (e) {
  console.error("Store corruption:", e);
}

export function useCVTStore() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const fn = () => forceUpdate(n => n + 1);
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }, []);

  const setIdentity = useCallback((identity: CVTIdentity | null) => {
    globalIdentity = identity;
    if (identity) localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
    else localStorage.removeItem(STORAGE_KEY);
    notify();
  }, []);

  const addMessage = useCallback((msg: CVTMessage) => {
    // Prevent duplicate messages by ID
    if (globalMessages.some(m => m.id === msg.id)) return;
    globalMessages = [msg, ...globalMessages];
    notify();
  }, []);

  const addContact = useCallback((contact: CVTContact) => {
    globalContacts = [...globalContacts, contact];
    notify();
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<CVTContact>) => {
    globalContacts = globalContacts.map(c => c.id === id ? { ...c, ...updates } : c);
    notify();
  }, []);

  const addRelayPacket = useCallback((pkt: RelayPacket) => {
    globalRelayLog = [pkt, ...globalRelayLog.slice(0, 99)]; // Keep last 100
    notify();
  }, []);

  return {
    identity: globalIdentity,
    messages: globalMessages,
    contacts: globalContacts,
    relayLog: globalRelayLog,
    setIdentity,
    addMessage,
    addContact,
    updateContact,
    addRelayPacket,
  };
}
