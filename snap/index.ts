import {
  MethodNotSupportedError,
  handleKeyringRequest,
} from "@metamask/keyring-api";
import type {
  OnKeyringRequestHandler,
  OnRpcRequestHandler,
} from "@metamask/snaps-types";

import { ThresholdKeyring } from "./keyring";
import { InternalMethod, originPermissions } from "./permissions";
import { getState } from "./stateManagement";

let keyring: ThresholdKeyring;

/**
 * Return the keyring instance. If it doesn't exist, create it.
 */
async function getKeyring(): Promise<ThresholdKeyring> {
  if (!keyring) {
    const state = await getState();
    keyring = new ThresholdKeyring(state);
  }
  return keyring;
}

/**
 * Verify if the caller can call the requested method.
 *
 * @param origin - Caller origin.
 * @param method - Method being called.
 * @returns True if the caller is allowed to call the method, false otherwise.
 */
function hasPermission(origin: string, method: string): boolean {
  return originPermissions.get(origin)?.includes(method) ?? false;
}

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  // Check if origin is allowed to call method.
  if (!hasPermission(origin, request.method)) {
    throw new Error(
      `Origin '${origin}' is not allowed to call '${request.method}'`,
    );
  }

  // Handle custom methods.
  switch (request.method) {
    case InternalMethod.GetAccountByAddress: {
      const address = (request.params as Record<string, unknown>)
        .address as string;
      const keyring = await getKeyring();
      const wallet = await keyring.findWalletByAddress(address);
      return wallet?.account;
    }
    case InternalMethod.GetWalletByAddress: {
      const address = (request.params as Record<string, unknown>)
        .address as string;
      const keyring = await getKeyring();
      return await keyring.getWalletByAddress(address);
    }
    case InternalMethod.DeleteKeyShare: {
      const id = (request.params as Record<string, unknown>).id as string;
      const keyShareId = (request.params as Record<string, unknown>)
        .keyShareId as string;
      const keyring = await getKeyring();
      return await keyring.deleteKeyShare(id, keyShareId);
    }
    default: {
      throw new MethodNotSupportedError(request.method);
    }
  }
};

export const onKeyringRequest: OnKeyringRequestHandler = async ({
  origin,
  request,
}) => {
  // Check if origin is allowed to call method.
  if (!hasPermission(origin, request.method)) {
    throw new Error(
      `Origin '${origin}' is not allowed to call '${request.method}'`,
    );
  }

  // Handle keyring methods.
  return handleKeyringRequest(await getKeyring(), request);
};
