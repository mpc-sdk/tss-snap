import { Transaction, TransactionReceiptParams } from "ethers";

// Private key share.
export type KeyShare = {
  localKey: LocalKey;
  publicKey: number[];
  address: string;
};

// Opaque type for the private key share.
export type LocalKey = {
  // Index of the key share.
  i: number;
  // Threshold for key share signing.
  t: number;
  // Total number of parties.
  n: number;
};

// Result of signing a message.
export type SignResult = {
  r: SignPrimitive;
  s: SignPrimitive;
  recid: number;
};

export type SignPrimitive = {
  // For ECDSA should be `secp256k1`.
  curve: string;
  // Array of bytes for the value, length will be 32.
  scalar: number[];
};

// Key share with a human-friendly label.
export type NamedKeyShare = {
  label: string;
  share: KeyShare;
};

export type SignProof = {
  signature: SignResult;
  address: string;
  value: SignValue;
  timestamp: number;
};

export type SignTxReceipt = {
  signature: SignResult;
  address: string;
  amount: string,
  // WARN: Storing the transaction is not possible at the moment
  // WARN: due to a typescript error with #private in the type
  // WARN: definition
  //tx: SignTransaction,
  value: TransactionReceiptParams;
  timestamp: number;
};

// Maps message signing proofs from key address.
export type MessageProofs = {
  [key: string]: SignProof[];
};

// Maps transaction receipts from key address.
export type TransactionReceipts = {
  [key: string]: SignTxReceipt[];
};

// Application state that can be persisted to disc by the snap backend.
export type AppState = {
  keyShares: NamedKeyShare[];
  messageProofs: MessageProofs;
  transactionReceipts: TransactionReceipts;
};

// Message to be signed.
export type SignMessage = {
  message: string;
  digest: Uint8Array;
};

export enum SigningType {
  MESSAGE = "message",
  TRANSACTION = "transaction",
}

// Type for signing transactions
export type SignTransaction = {
  transaction: Transaction;
  digest: Uint8Array;
};

export type SignValue = SignMessage | SignTransaction;