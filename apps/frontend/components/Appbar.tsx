"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Appbar() {
  return (
    <header className="border-b border-zinc-900 bg-[#0b0c0e]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-zinc-800 bg-[#111214]">
            <Activity className="h-4 w-4 text-zinc-200" />
          </div>

          <div className="leading-none">
            <p className="text-sm font-medium text-zinc-100">Atlas Uptime</p>
            <p className="mt-1 text-xs text-zinc-500">
              Validator-backed monitoring
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
              >
                Sign in
              </Button>
            </SignInButton>

            <SignUpButton mode="modal">
              <Button
                size="sm"
                className="bg-zinc-100 text-zinc-950 hover:bg-white"
              >
                Sign up
              </Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-zinc-500 sm:inline">
                Account
              </span>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}