"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Appbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-900/80 bg-[#0b0c0e]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-zinc-800 bg-[#111214]">
            <Activity className="h-4 w-4 text-zinc-200" />
          </div>

          <div className="min-w-0 leading-none">
            <p className="truncate text-sm font-medium text-zinc-100">
              Atlas Uptime
            </p>
            <p className="mt-1 truncate text-xs text-zinc-500">
              Validator-backed monitoring
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/dashboard" className="shrink-0">
            <Button
              size="sm"
              className="h-9 gap-2 bg-zinc-100 px-4 text-zinc-950 hover:bg-white"
            >
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
                >
                  Sign in
                </Button>
              </SignInButton>

              <SignUpButton mode="modal">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 border-zinc-800 bg-transparent px-3 text-zinc-200 hover:bg-zinc-900 hover:text-zinc-100"
                >
                  Sign up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex h-9 items-center pl-1">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                    userButtonTrigger:
                      "rounded-full border border-zinc-800 focus:shadow-none",
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