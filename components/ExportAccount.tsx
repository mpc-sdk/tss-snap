import React from "react";
import type { KeyringAccount } from "@metamask/keyring-api";

import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import Icons from "@/components/Icons";

import { exportAccount } from "@/lib/keyring";
import { toUint8Array, download } from "@/lib/utils";
import guard  from "@/lib/guard";

export default function ExportAccount({
  account,
}: {
  account: KeyringAccount;
}) {
  const { toast } = useToast();

  const downloadAccount = async () => {
    await guard(async () => {
      const privateKey = await exportAccount(account.id);

      // FIXME: find the address
      const address = "";

      const exportedAccount = {
        privateKey,
        address,
      };

      const fileName = `${address}.json`;
      const value = JSON.stringify(exportedAccount, undefined, 2);
      download(fileName, toUint8Array(value));

    }, toast);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Icons.download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Export account</AlertDialogTitle>
          <AlertDialogDescription>
            Exporting this account will download the private key to your
            computer unencrypted; you should copy the file to safe encrypted
            storage such as a password manager and delete the downloaded file
            from your disc.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={downloadAccount}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
