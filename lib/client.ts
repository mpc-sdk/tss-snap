import {
  Protocol,
  Keypair,
  KeygenOptions,
  PublicKeys,
  ServerOptions,
  MeetingOptions,
  KeyShare,
} from "@/app/model";

import { Parameters } from "@/lib/types";

// Cache of server options.
let serverOptions: ServerOptions = null;
let keypair: Keypair = null;

export type WebassemblyWorker = {
  // Generate a noise protocol keypair using the default pattern.
  generateKeypair: () => Promise<[string, string]>;
  // Create meeting gets a meeting identifier.
  createMeeting: (
    options: MeetingOptions,
    identifiers: string[],
    initiator: string,
    data: unknown,
  ) => Promise<string>;
  // Join meeting gets the public keys of all participants.
  joinMeeting: (
    options: MeetingOptions,
    meetingId: string,
    userId: string,
  ) => Promise<[string[], unknown]>;
  keygen: (options: KeygenOptions, publicKeys: PublicKeys) => Promise<KeyShare>;
};

// Convert from a ws: (or wss:) protocol to http: or https:.
export function convertUrlProtocol(server: string): string {
  const url = new URL(server);
  if (url.protocol === "ws:") {
    url.protocol = "http:";
  } else if (url.protocol === "wss:") {
    url.protocol = "https:";
  }
  return url.toString().replace(/\/+$/, "");
}

// Get the public key of the backend server and cache the result.
export async function fetchServerPublicKey(
  serverUrl: string,
): Promise<ServerOptions> {
  if (serverOptions != null && serverOptions.serverUrl === serverUrl) {
    return serverOptions;
  }

  let url = convertUrlProtocol(serverUrl);
  url = `${url}/public-key`;
  const response = await fetch(url);

  if (response.status !== 200) {
    throw new Error(
      `unexpected status code fetching public key: ${response.status}`,
    );
  }
  const serverPublicKey = await response.text();
  serverOptions = {
    serverUrl: serverUrl,
    serverPublicKey,
  };
  return serverOptions;
}

// Generate a keypair or return a cached session keypair.
export async function generateKeypair(
  worker: WebassemblyWorker,
): Promise<Keypair> {
  if (keypair !== null) {
    return keypair;
  }
  const [pem, publicKey] = await worker.generateKeypair();
  keypair = { pem, publicKey };
  return keypair;
}

// Create a meeting point for public key exchange.
export async function createMeeting(
  worker: WebassemblyWorker,
  serverUrl: string,
  identifiers: string[],
  initiator: string,
  data: unknown,
): Promise<string> {
  const server = await fetchServerPublicKey(serverUrl);
  const keypair = await generateKeypair(worker);
  const options: MeetingOptions = {
    server,
    keypair: keypair.pem,
  };
  return await worker.createMeeting(options, identifiers, initiator, data);
}

// Join a meeting point for public key exchange.
export async function joinMeeting(
  worker: WebassemblyWorker,
  serverUrl: string,
  meetingId: string,
  userId: string,
): Promise<[string[], unknown]> {
  const server = await fetchServerPublicKey(serverUrl);
  const keypair = await generateKeypair(worker);
  const options: MeetingOptions = {
    server,
    keypair: keypair.pem,
  };
  return await worker.joinMeeting(options, meetingId, userId);
}

// Perform key generation.
//
// Only the initiator needs to submit the participant public keys,
// participants joining do not need to specify the participants
// and MUST pass null.
export async function keygen(
  worker: WebassemblyWorker,
  serverUrl: string,
  parameters: Parameters,
  participants?: PublicKeys,
): Promise<KeyShare> {
  const server = await fetchServerPublicKey(serverUrl);
  const keypair = await generateKeypair(worker);
  const options: KeygenOptions = {
    server,
    keypair: keypair.pem,
    protocol: Protocol.gg20,
    parameters,
  };
  return await worker.keygen(options, participants);
}
