"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Globe2,
  Moon,
  Radio,
  Server,
  ShieldCheck,
  Sun,
  Vote,
  Waves,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="border-b border-zinc-900 py-5">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center border border-zinc-800 bg-[#111214]">
                <Activity className="h-4.5 w-4.5 text-zinc-200" />
              </div>

              <div className="text-left">
                <p className="text-sm font-medium text-zinc-100">Atlas Uptime</p>
                <p className="text-xs text-zinc-500">Validator-backed monitoring</p>
              </div>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="border border-zinc-800 p-2.5 text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white"
              >
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main>
          <section className="grid gap-14 border-b border-zinc-900 py-16 lg:grid-cols-[1.2fr_0.95fr] lg:items-end lg:py-24">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Realtime distributed monitoring
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold leading-[1.04] tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
                Monitor websites through independent validators, not a single blind check.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
                Atlas Uptime coordinates validator nodes over WebSockets, collects signed website
                checks, applies majority voting to determine monitor health, and streams live system
                state back into the dashboard.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="inline-flex items-center justify-center gap-2 bg-zinc-100 px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-white"
                >
                  View dashboard
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => {
                    const section = document.getElementById("architecture");
                    section?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="border border-zinc-800 px-5 py-3 text-sm text-zinc-300 transition hover:bg-zinc-900"
                >
                  See architecture
                </button>
              </div>
            </div>

            <div className="border border-zinc-900 bg-[#111214] p-5">
              <div className="border-b border-zinc-900 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-100">Live topology</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Current monitoring flow and consensus path
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.16em] text-zinc-600">
                    System
                  </span>
                </div>
              </div>

              <div className="space-y-4 py-5">
                <TopologyRow
                  title="Hub"
                  description="Schedules checks, maintains validator connections, and aggregates results."
                />
                <TopologyRow
                  title="Validator nodes"
                  description="Independent workers fetch targets, measure health, and sign responses."
                />
                <TopologyRow
                  title="Consensus"
                  description="Multiple validator responses are merged into a majority decision."
                />
                <TopologyRow
                  title="Realtime stream"
                  description="The frontend receives live monitoring updates over WebSockets."
                  isLast
                />
              </div>
            </div>
          </section>

          <section className="grid gap-8 border-b border-zinc-900 py-14 sm:grid-cols-2 xl:grid-cols-4">
            <MetricBlock label="Validators" value="3+" />
            <MetricBlock label="Consensus" value="Majority vote" />
            <MetricBlock label="Updates" value="Realtime" />
            <MetricBlock label="Scope" value="Monitor + node health" />
          </section>

          <section className="grid gap-10 border-b border-zinc-900 py-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Why this matters
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                Built for stronger signals than single-node uptime checks.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">
                The interface reflects the actual engineering value of the system: independent
                validators, result aggregation, live event flow, and health visibility across nodes.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <MinimalFeature
                icon={<Server className="h-4 w-4" />}
                title="Independent validators"
                description="Multiple validator instances can connect to the hub and participate in monitoring simultaneously."
              />
              <MinimalFeature
                icon={<Vote className="h-4 w-4" />}
                title="Consensus-based status"
                description="Website health can be derived from majority voting instead of trusting one isolated result."
              />
              <MinimalFeature
                icon={<Waves className="h-4 w-4" />}
                title="Realtime updates"
                description="The dashboard can receive live system events and monitor changes without waiting for manual refresh."
              />
              <MinimalFeature
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Validator health metadata"
                description="Track last seen, total checks, success rate, and average latency for each validator node."
              />
            </div>
          </section>

          <section
            id="architecture"
            className="grid gap-10 border-b border-zinc-900 py-14 lg:grid-cols-[0.8fr_1.2fr]"
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Architecture
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                One hub, many validators, one observable system.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">
                Validators connect over WebSockets, identify themselves with their own keypairs,
                validate assigned websites, and return results that the hub can aggregate and store.
              </p>
            </div>

            <div className="border border-zinc-900 bg-[#111214] p-6">
              <div className="space-y-5">
                <FlowItem
                  label="1"
                  title="Validator connects"
                  subtitle="Each node joins the hub with its own identity and connection state."
                />
                <FlowDivider />
                <FlowItem
                  label="2"
                  title="Validation job dispatched"
                  subtitle="The hub sends monitoring work to all active validators."
                />
                <FlowDivider />
                <FlowItem
                  label="3"
                  title="Signed results returned"
                  subtitle="Each validator submits its response, latency, and verification data."
                />
                <FlowDivider />
                <FlowItem
                  label="4"
                  title="Majority decision stored"
                  subtitle="The hub computes overall health and persists monitor history."
                />
              </div>
            </div>
          </section>

          <section className="grid gap-10 border-b border-zinc-900 py-14 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Validator visibility
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                Node health becomes part of the product, not hidden backend detail.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">
                As the system grows from one validator to several regions, the UI should expose node
                health and operational context directly in the dashboard.
              </p>
            </div>

            <div className="border border-zinc-900 bg-[#111214] p-4 sm:p-5">
              <div className="grid gap-4 border-b border-zinc-900 pb-4 sm:grid-cols-4">
                <PreviewMetric label="Region" value="Mumbai" />
                <PreviewMetric label="Success rate" value="99.4%" />
                <PreviewMetric label="Avg latency" value="183ms" />
                <PreviewMetric label="Last seen" value="3s ago" />
              </div>

              <div className="space-y-3 pt-4">
                <ValidatorRow
                  name="validator-a"
                  region="India"
                  state="Healthy"
                  stateColor="text-emerald-300"
                />
                <ValidatorRow
                  name="validator-b"
                  region="Singapore"
                  state="Healthy"
                  stateColor="text-emerald-300"
                />
                <ValidatorRow
                  name="validator-c"
                  region="Frankfurt"
                  state="Lagging"
                  stateColor="text-amber-300"
                />
              </div>
            </div>
          </section>

          <section className="grid gap-10 border-b border-zinc-900 py-14 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Realtime feed
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                Show events as they happen.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">
                Realtime delivery makes the dashboard feel like a monitoring interface instead of a
                static report. Connection state and live event flow become part of the UX.
              </p>
            </div>

            <div className="border border-zinc-900 bg-[#111214] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between border-b border-zinc-900 pb-4">
                <div>
                  <p className="text-sm font-medium text-zinc-100">Live events</p>
                  <p className="mt-1 text-sm text-zinc-500">WebSocket-driven system activity</p>
                </div>

                <div className="inline-flex items-center gap-2 text-xs text-emerald-300">
                  <Radio className="h-3.5 w-3.5" />
                  Connected
                </div>
              </div>

              <div className="space-y-3">
                <EventRow
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  title="Consensus updated"
                  description="app.atlas-uptime.dev marked operational after 2 of 3 validator responses succeeded."
                />
                <EventRow
                  icon={<Clock3 className="h-4 w-4" />}
                  title="Validator heartbeat"
                  description="validator-b reported latency and lastSeen metadata from the Singapore region."
                />
                <EventRow
                  icon={<Globe2 className="h-4 w-4" />}
                  title="Website check completed"
                  description="api.atlas-uptime.dev processed through three concurrent validator checks."
                />
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="flex flex-col gap-6 border border-zinc-900 bg-[#111214] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  Explore the product
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                  Open the dashboard and inspect the monitoring flow directly.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">
                  The strongest part of this project is the interface between distributed system
                  design and operational visibility.
                </p>
              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center justify-center gap-2 bg-zinc-100 px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-white"
              >
                Go to dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </main>

        <footer className="border-t border-zinc-900 py-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-zinc-300">Atlas Uptime</p>
              <p className="text-sm text-zinc-500">
                Distributed monitoring with validators, consensus, and realtime visibility.
              </p>
            </div>
            <p className="text-sm text-zinc-500">2026</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function MetricBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-100">{value}</p>
    </div>
  );
}

function TopologyRow({
  title,
  description,
  isLast = false,
}: {
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className={isLast ? "" : "border-b border-zinc-900 pb-4"}>
      <p className="text-sm font-medium text-zinc-100">{title}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
    </div>
  );
}

function MinimalFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="mb-3 text-zinc-400">{icon}</div>
      <h3 className="text-base font-medium text-zinc-100">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-zinc-500">{description}</p>
    </div>
  );
}

function FlowItem({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-zinc-800 text-xs text-zinc-400">
        {label}
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-100">{title}</p>
        <p className="mt-1 text-sm leading-6 text-zinc-500">{subtitle}</p>
      </div>
    </div>
  );
}

function FlowDivider() {
  return <div className="ml-4 h-4 w-px bg-zinc-800" />;
}

function PreviewMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-zinc-100">{value}</p>
    </div>
  );
}

function ValidatorRow({
  name,
  region,
  state,
  stateColor,
}: {
  name: string;
  region: string;
  state: string;
  stateColor: string;
}) {
  return (
    <div className="grid gap-3 border-b border-zinc-900 pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[1.2fr_1fr_0.8fr]">
      <p className="text-sm text-zinc-200">{name}</p>
      <p className="text-sm text-zinc-500">{region}</p>
      <p className={`text-sm ${stateColor}`}>{state}</p>
    </div>
  );
}

function EventRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-zinc-900 pb-3 last:border-b-0 last:pb-0">
      <div className="mb-2 flex items-center gap-3 text-zinc-300">
        <span className="text-zinc-500">{icon}</span>
        <p className="text-sm font-medium text-zinc-100">{title}</p>
      </div>
      <p className="pl-7 text-sm leading-6 text-zinc-500">{description}</p>
    </div>
  );
}