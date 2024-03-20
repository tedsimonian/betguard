"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { FieldPath, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form/form";
import { Input } from "@/components/ui/input/input";

import { defaultWallet, type Wallet, walletAtom } from "@/state/atoms/wallet-atom";
import { ServerActionState } from "@/types/common";
import { getWalletInfo } from "./actions";
import { formSchema } from "./validation";

export type FormValues = {
  walletAddress: string;
};

export const WalletLookupForm = () => {
  const [_, setWallet] = useAtom(walletAtom);

  const form = useForm<FormValues>({
    mode: "all",
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletAddress: "",
    },
  });

  const [state, formAction] = useFormState<ServerActionState<Wallet>, FormData>(getWalletInfo, null);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (!state) {
      setWallet(defaultWallet);
      return;
    }
    if (state.status === "error") {
      console.log(state.errors);
      state.errors?.forEach((error) => {
        form.setError(error.path as FieldPath<FormValues>, {
          message: error.message,
        });
      });
      setWallet(defaultWallet);
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
          name="walletAddress"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input placeholder="XXXXXXXXXXXXXXXX" {...field} />
                  <Button type="submit" disabled={pending || !form.formState.isValid}>
                    {pending ? "Loading..." : "Lookup Wallet"}
                  </Button>
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
