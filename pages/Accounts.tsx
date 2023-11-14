import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

import Heading from "@/components/Heading";
import Icons from "@/components/Icons";
import KeyAlert from "@/components/KeyAlert";
import ChainBadge from "@/components/ChainBadge";
import AccountsLoader from "@/components/AccountsLoader";
import ImportAccount from "@/components/ImportAccount";
import SharesBadge from "@/components/SharesBadge";

import { accountsSelector, invalidateAccounts } from "@/app/store/accounts";
import { abbreviateAddress } from "@/lib/utils";

function AccountsContent({
  children,
  onImportComplete,
}: {
  children?: React.ReactNode;
  onImportComplete: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <Heading>Accounts</Heading>
          <ChainBadge className="mt-2" />
        </div>
        <div className="flex space-x-4">
          <ImportAccount onImportComplete={onImportComplete} />
          <Link to="/keys/create">
            <Button>
              <Icons.plus className="h-4 w-4 mr-2" />
              New
            </Button>
          </Link>
        </div>
      </div>
      {children}
    </>
  );
}

function NoAccounts({ onImportComplete }: { onImportComplete: () => void }) {
  return (
    <AccountsContent onImportComplete={onImportComplete}>
      <div className="mt-12">
        <KeyAlert
          title="No accounts yet!"
          description="To get started create a new key."
        />
      </div>
    </AccountsContent>
  );
}

export default function Accounts() {
  const dispatch = useDispatch();
  const [refresh, setRefresh] = useState(0);
  const { accounts, loaded } = useSelector(accountsSelector);

  if (!loaded) {
    return <AccountsLoader />;
  }

  const onChanged = async () => {
    await dispatch(invalidateAccounts());
    setRefresh(refresh + 1);
  };

  if (accounts.length == 0) {
    return <NoAccounts onImportComplete={onChanged} />;
  }

  return (
    <AccountsContent onImportComplete={onChanged}>
      <div className="mt-12 border rounded-md">
        {accounts.map((account) => {
          const { name } = account.options as {
            name: string;
          };
          return (
            <div
              key={account.id}
              className="[&:not(:last-child)]:border-b flex p-4 items-center justify-between"
            >
              <div>
                <div>{name}</div>
                <div className="text-sm">
                  {abbreviateAddress(account.address)}
                </div>
                <SharesBadge account={account} />
              </div>
              <div className="flex space-x-4">
                <Link to={`/accounts/${account.address}`}>
                  <Button variant="outline">
                    <Icons.pencil className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </AccountsContent>
  );
}
