"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { FieldPath, useForm } from "react-hook-form";

import { Form, FormButton, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form/form";
import { Input } from "@/components/ui/input/input";

import { default_wallet, type Wallet, wallet_atom } from "@/state/atoms/wallet-atom";
import { ServerActionState } from "@/types/common";
import { getWalletInfo } from "./actions";
import { form_schema } from "./validation";

export type FormValues = {
  wallet_address: string;
};

export const WalletLookupForm = () => {
  const [_, setWallet] = useAtom(wallet_atom);

  const form = useForm<FormValues>({
    mode: "all",
    resolver: zodResolver(form_schema),
    defaultValues: {
      wallet_address: "",
    },
  });

  const [state, formAction] = useFormState<ServerActionState<Wallet>, FormData>(getWalletInfo, null);

  useEffect(() => {
    if (!state) {
      setWallet(default_wallet);
      return;
    }
    if (state.status === "error") {
      console.debug("state", state);
      console.debug(state.errors);
      state.errors?.forEach((error) => {
        form.setError(error.path as FieldPath<FormValues>, {
          message: error.message,
        });
      });
      setWallet(default_wallet);
    }
    if (state.status === "success") {
      setWallet(state.data!);
    }
  }, [state, form, setWallet]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-8">
        <FormField
          control={form.control}
          name="wallet_address"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex w-full max-w-md items-center space-x-2">
                  <Input className="w-80" placeholder="XXXXXXXXXXXXXXXX" {...field} />
                  <FormButton type="submit" loadingText="Loading...">
                    Lookup Wallet
                  </FormButton>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
