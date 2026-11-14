"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { SignedIn, SignedOut, SignInButton, UserButton, } from "@clerk/nextjs";

const METRICS = [
  { label: "Validators online", value: "3", unit: "nodes", note: "Independent, individually keyed" },
  {
    label: "Consensus rule",
    value: "Majority",
    unit: "agreement",
    note: "Among validators currently connected",
  },
  {
    label: "Update cadence",
    value: "Interval",
    unit: "checks",
    note: "Validators re-check on a regular interval",
  },
  { label: "Scope", value: "3→N", unit: "scale", note: "Three today, built to add many more" },
];

const WHY = [
  {
    k: "01",
    title: "One vantage point is one opinion",
    body: "A single checker sees the internet from exactly one place. Local routing trouble looks identical to a real outage, and you page someone for nothing.",
  },
  {
    k: "02",
    title: "Independent observers disagree usefully",
    body: "When validators in different regions check the same target, disagreement is signal. Atlas keeps the disagreement instead of averaging it away.",
  },
  {
    k: "03",
    title: "Every result is attributable",
    body: "Validators sign the checks they report. The hub can tell you which node said what, when it said it, and whether it was trusted at the time.",
  },
  {
    k: "04",
    title: "A decision, not a guess",
    body: "Status flips only when a majority of reporting validators agree. Fewer false alarms, and a clear record of how the call was made.",
  },
];

const FLOW = [
  {
    step: "Connect",
    title: "Validator opens a socket",
    body: "Each validator dials the hub over a persistent WebSocket and identifies itself with its Solana public key.",
  },
  {
    step: "Assign",
    title: "Hub distributes targets",
    body: "The hub tracks which validators are currently connected and hands each of them the targets to watch.",
  },
  {
    step: "Check",
    title: "Validator probes the target",
    body: "The validator performs the check on its own and records status, latency, and timestamp — no shared vantage point.",
  },
  {
    step: "Sign",
    title: "Result is signed and returned",
    body: "The report is signed with the validator's keypair and streamed back to the hub over the same connection.",
  },
  {
    step: "Aggregate",
    title: "Hub verifies and tallies",
    body: "Signatures are verified, reports from disconnected validators are ignored, and the remaining votes are collected in Postgres.",
  },
  {
    step: "Decide",
    title: "Majority agreement",
    body: "Status is whatever the majority of currently connected validators report. Three today; the same loop holds as nodes are added.",
  },
];

const VALIDATORS = [
  { id: "validator-01", region: "Local / dev host", success: 99.4, latency: 61, seen: "3s ago", state: "healthy" },
  { id: "validator-02", region: "Local / dev host", success: 98.9, latency: 74, seen: "5s ago", state: "healthy" },
  { id: "validator-03", region: "Local / dev host", success: 97.6, latency: 118, seen: "9s ago", state: "degraded" },
];

const FEED = [
  { t: "12:04:31", kind: "consensus", text: "example.com — UP by majority (3 of 3 reporting)" },
  { t: "12:04:29", kind: "check", text: "validator-01 signed check · 200 · 58ms" },
  { t: "12:04:27", kind: "join", text: "validator-03 reconnected over WebSocket" },
  { t: "12:04:24", kind: "check", text: "validator-02 signed check · 200 · 73ms" },
  { t: "12:04:21", kind: "warn", text: "validator-03 latency above its own baseline" },
  { t: "12:04:18", kind: "consensus", text: "example.com — UP by majority (2 of 2 reporting)" },
];

const NODES = [
  { x: 16, y: 24 },
  { x: 14, y: 74 },
  { x: 84, y: 44 },
];

const GET_STARTED = [
  {
    k: "01",
    title: "Generate a keypair",
    body: "Create a Solana keypair for the validator. Its public key is the node's identity; the private key signs every check it reports.",
  },
  {
    k: "02",
    title: "Run the validator process",
    body: "Start the Node.js validator with the hub URL and the keypair. It needs no inbound ports — it dials out.",
  },
  {
    k: "03",
    title: "It connects automatically",
    body: "The validator opens its WebSocket, registers with the hub, and starts receiving targets. Its reports join the majority count immediately.",
  },
];

const STACK = [
  ["Node.js", "validators + hub"],
  ["WebSockets", "persistent transport"],
  ["PostgreSQL", "checks + consensus history"],
  ["Solana keypairs", "signed reports"],
] as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-signal/60" />
      <span className="eyebrow">{children}</span>
    </div>
  );
}

function CTA({
  to,
  href,
  variant = "primary",
  children,
}: {
  to?: string;
  href?: string;
  variant?: "primary" | "ghost";
  children: React.ReactNode;
}) {
  const base =
    "group relative inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300";
  const styles =
    variant === "primary"
      ? "bg-signal text-signal-foreground hover:brightness-105 shadow-[var(--shadow-signal)]"
      : "border border-border bg-surface/60 text-foreground hover:border-signal/40 hover:bg-surface-raised";
  const cls = `${base} ${styles}`;
  const inner = (
    <>
      {children}
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </>
  );

  if (to) {
    return (
      <Link href={to} className={cls}>
        {inner}
      </Link>
    );
  }

  return (
    <a href={href} className={cls}>
      {inner}
    </a>
  );
}

function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-6 ${className}`}>
      {children}
    </section>
  );
}

function Topology() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1600);
    return () => clearInterval(i);
  }, []);

  const active = useMemo(() => tick % NODES.length, [tick]);

  return (

    <div className="panel relative overflow-hidden p-6 sm:p-10">
      <div className="pointer-events-none absolute inset-0 grid-field" />
      <div className="relative aspect-[16/10] w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {NODES.map((n, i) => (
            <line
              key={i}
              x1={n.x}
              y1={n.y}
              x2={50}
              y2={50}
              stroke="currentColor"
              className={i === active ? "text-signal" : "text-muted-foreground/35"}
              strokeWidth={i === active ? 0.45 : 0.25}
              strokeDasharray="2 2"
              style={{ animation: "atlas-dash 1.6s linear infinite" }}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {NODES.map((n, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <div className="relative flex items-center gap-2">
              <span
                className={`block size-2.5 rounded-full ring-4 transition-colors duration-500 ${i === active ? "bg-signal ring-signal/15" : "bg-muted-foreground/70 ring-transparent"
                  }`}
              />
              <span className="hidden font-mono text-[10px] text-muted-foreground sm:block">
                validator-{String(i + 1).padStart(2, "0")}
              </span>
            </div>
          </div>
        ))}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative rounded-2xl border border-signal/30 bg-surface-raised px-5 py-4 text-center shadow-[var(--shadow-signal)]">
            <span
              className="absolute -inset-3 -z-10 rounded-3xl bg-signal/10"
              style={{ animation: "atlas-pulse 3s ease-in-out infinite" }}
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal">Hub</p>
            <p className="mt-1 font-display text-sm font-semibold">Coordinator</p>
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">consensus · fanout</p>
          </div>
        </div>
      </div>

      <div className="relative mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
        {[
          ["Validators", "Check targets independently"],
          ["WebSocket links", "Persistent, bidirectional"],
          ["Hub", "Verifies, tallies, broadcasts"],
        ].map(([t, d]) => (
          <div key={t}>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-signal">{t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveFeed() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setOffset((o) => (o + 1) % FEED.length), 2200);
    return () => clearInterval(i);
  }, []);

  const rows = useMemo(
    () => Array.from({ length: FEED.length }, (_, i) => FEED[(i + offset) % FEED.length]),
    [offset],
  );

  const tone: Record<string, string> = {
    consensus: "text-signal",
    check: "text-foreground",
    join: "text-accent",
    warn: "text-warn",
  };

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="size-2 rounded-full bg-signal"
            style={{ animation: "atlas-pulse 2s ease-in-out infinite" }}
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Realtime event stream
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">hub://events</span>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((e, i) => (
          <li
            key={`${e.t}-${i}-${offset}`}
            className="flex items-start gap-4 px-5 py-3 font-mono text-[12px] leading-relaxed"
            style={{ animation: "atlas-rise 420ms ease-out both", animationDelay: `${i * 45}ms` }}
          >
            <span className="shrink-0 text-muted-foreground">{e.t}</span>
            <span className={`shrink-0 uppercase tracking-[0.12em] ${tone[e.kind]}`}>{e.kind}</span>
            <span className="text-muted-foreground">{e.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HomePage() {
  return (

    <main className="relative min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="relative grid size-7 place-items-center rounded-md border border-signal/40 bg-signal/10">
              <span className="size-2 rounded-full bg-signal" />
            </span>
            <span className="font-display text-[15px] font-semibold tracking-tight">Atlas Uptime</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#topology" className="transition-colors hover:text-foreground">
              Topology
            </a>
            <a href="#why" className="transition-colors hover:text-foreground">
              Why consensus
            </a>
            <a href="#architecture" className="transition-colors hover:text-foreground">
              Architecture
            </a>
            <a href="#validators" className="transition-colors hover:text-foreground">
              Validators
            </a>
          </nav>
          
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-signal/40 hover:text-foreground">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-signal/40 hover:text-foreground"
              >
                Open dashboard
              </Link>

              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>


      <div className="relative">
        <div className="pointer-events-none absolute inset-0 aurora opacity-70" />
        <div className="pointer-events-none absolute inset-0 grid-field" />
        <Section className="relative pb-28 pt-24 sm:pt-20">
          <div className="grid items-end gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
             

              <h1 className="mt-7 font-display text-[2.75rem] font-semibold leading-[1.03] tracking-[-0.03em] sm:text-6xl lg:text-[4.25rem]">
                Distributed eyes <span className="text-signal-gradient">on your uptime, 24/7</span>
              </h1>

              <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
                Every check is performed independently by a separate validator node, signed with that node&apos;s key,
                and streamed back to a coordinating hub. The hub confirms status only when the connected validators
                agree - a majority decision, not one observer&apos;s guess. The network runs on 3 validator nodes today
                and is built to scale to many more.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <CTA to="/dashboard">Open the dashboard</CTA>
                <CTA href="#architecture" variant="ghost">
                  View the architecture
                </CTA>
              </div>
            </div>

            <div className="panel relative overflow-hidden p-6">
              <div className="flex items-center justify-between">
                <span className="eyebrow">Current consensus</span>
                <span className="font-mono text-[11px] text-signal">LIVE</span>
              </div>
              <p className="mt-5 font-display text-5xl font-semibold tracking-tight">3 / 3</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                connected validators reporting <span className="text-signal">UP</span> for example.com
              </p>
              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-full rounded-full bg-signal" />
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 font-mono text-[11px]">
                {[
                  ["Signatures", "verified"],
                  ["Majority", "reached"],
                  ["Nodes today", "3"],
                  ["Transport", "websocket"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-muted-foreground uppercase tracking-[0.12em]">{k}</dt>
                    <dd className="mt-1 text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
              <span
                className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-signal/10 to-transparent"
                style={{ animation: "atlas-sweep 5s ease-in-out infinite" }}
              />
            </div>
          </div>
        </Section>
      </div>

      <Section className="pb-24">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m) => (
            <div key={m.label} className="bg-surface px-6 py-7">
              <p className="eyebrow">{m.label}</p>
              <p className="mt-4 font-display text-4xl font-semibold tracking-tight">
                {m.value}
                <span className="ml-1.5 font-mono text-xs font-normal text-muted-foreground">{m.unit}</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="topology" className="pb-28">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <Eyebrow>Live topology</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              The hub coordinates. The validators observe.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Validators hold an open WebSocket to the hub. Assignments flow out, signed check results flow back, and
            the shape of the network is visible at all times.
          </p>
        </div>
        <Topology />
      </Section>

      <Section id="why" className="pb-28">
        <div className="mb-12 max-w-2xl">
          <Eyebrow>Why this matters</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Uptime is a claim. Consensus is evidence.
          </h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
          {WHY.map((w) => (
            <article key={w.k} className="group bg-surface p-8 transition-colors hover:bg-surface-raised">
              <span className="font-mono text-xs text-signal">{w.k}</span>
              <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">{w.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="architecture" className="pb-28">
        <div className="mb-12 max-w-2xl">
          <Eyebrow>Architecture</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            From validator connect to majority decision.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Six stages, one continuous loop. It runs today across 3 validator nodes, and the same path holds unchanged
            as more nodes are added.
          </p>
        </div>

        <ol className="relative grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {FLOW.map((f, i) => (
            <li key={f.step} className="relative bg-surface p-7">
              <div className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full border border-signal/40 font-mono text-[11px] text-signal">
                  {i + 1}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {f.step}
                </span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-border bg-surface/60 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {["connect", "assign", "check", "sign", "aggregate", "consensus"].map((s, i, arr) => (
            <span key={s} className="flex items-center gap-3">
              <span className={i === arr.length - 1 ? "text-signal" : ""}>{s}</span>
              {i < arr.length - 1 && <span className="text-border">/</span>}
            </span>
          ))}
        </div>
      </Section>

      <Section id="validators" className="pb-28">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <Eyebrow>Validator visibility</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              The health of the network is part of the product.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            All three nodes, with success rate, latency, and last seen — so you can judge the reporters, not just the
            reports.
          </p>
        </div>

        <div className="panel overflow-hidden">
          <div className="hidden grid-cols-[1.4fr_1fr_0.9fr_0.9fr_0.8fr] gap-4 border-b border-border px-6 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:grid">
            <span>Validator</span>
            <span>Region</span>
            <span>Success rate</span>
            <span>Latency</span>
            <span>Last seen</span>
          </div>
          <ul className="divide-y divide-border">
            {VALIDATORS.map((v) => (
              <li
                key={v.id}
                className="grid grid-cols-2 gap-4 px-6 py-4 transition-colors hover:bg-surface-raised md:grid-cols-[1.4fr_1fr_0.9fr_0.9fr_0.8fr] md:items-center"
              >
                <div className="col-span-2 flex items-center gap-3 md:col-span-1">
                  <span className={`size-2 rounded-full ${v.state === "healthy" ? "bg-signal" : "bg-warn"}`} />
                  <span className="font-mono text-[13px]">{v.id}</span>
                </div>
                <span className="text-sm text-muted-foreground">{v.region}</span>
                <div>
                  <span className="font-mono text-[13px]">{v.success.toFixed(2)}%</span>
                  <div className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${v.state === "healthy" ? "bg-signal" : "bg-warn"}`}
                      style={{ width: `${v.success}%` }}
                    />
                  </div>
                </div>
                <span className="font-mono text-[13px] text-muted-foreground">{v.latency} ms</span>
                <span className="font-mono text-[13px] text-muted-foreground">{v.seen}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="pb-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <Eyebrow>Realtime feed</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Watch the system think.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              The dashboard streams system state as it happens: validators connecting, signed checks landing from each
              of the three nodes, and every status the hub settles on.
            </p>
          </div>
          <LiveFeed />
        </div>
      </Section>

      <Section id="get-started" className="pb-28">
        <div className="mb-12 max-w-2xl">
          <Eyebrow>Get started</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Adding a validator takes three steps.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            The network is three nodes today. A fourth joins the same way the first three did.
          </p>
        </div>
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {GET_STARTED.map((s) => (
            <li key={s.k} className="bg-surface p-8">
              <span className="font-mono text-xs text-signal">{s.k}</span>
              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="open" className="pb-28">
        <div className="panel relative overflow-hidden px-8 py-16 text-center sm:px-16">
          <div className="pointer-events-none absolute inset-0 aurora opacity-60" />
          <div className="pointer-events-none absolute inset-0 grid-field" />
          <div className="relative mx-auto max-w-2xl">
            <Eyebrow>
              <span className="mx-auto">Ready when you are</span>
            </Eyebrow>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.025em] sm:text-[2.75rem] sm:leading-[1.08]">
              See your uptime decided by agreement, not a guess.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
              Open the dashboard to see the real monitoring data: the targets being watched, what each validator
              reported, and the status the hub settled on.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <CTA to="/dashboard">Open the dashboard</CTA>
              <CTA href="#architecture" variant="ghost">
                View the architecture
              </CTA>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pb-24">
        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface/60 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <span className="eyebrow">Built with</span>
          <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2 md:grid-cols-4">
            {STACK.map(([name, use]) => (
              <div key={name}>
                <p className="font-mono text-[13px] text-foreground">{name}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{use}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid size-6 place-items-center rounded-md border border-signal/40 bg-signal/10">
                <span className="size-1.5 rounded-full bg-signal" />
              </span>
              <span className="font-display text-sm font-semibold tracking-tight">Atlas Uptime</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Distributed uptime monitoring decided by independent validators.
            </p>
          </div>
          <p className="border-t border-border pt-6 font-mono text-[11px] leading-relaxed text-muted-foreground">
            About this project — built to explore distributed validator consensus for uptime monitoring. It runs on 3
            validator nodes today.
          </p>
        </div>
      </footer>
    </main>
  );
}