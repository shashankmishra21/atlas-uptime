"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useWebsites } from "@/hooks/useWebsites";
import { API_BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs";

type UptimeStatus = "good" | "bad" | "unknown";

interface Round {
  status: string;
  createdAt: string;
}

interface Website {
  id: string;
  url: string;
  currentStatus: string;
  lastCheckedAt?: string | null;
  lastLatency?: number | null;
  rounds: Round[];
}

interface ProcessedWebsite {
  id: string;
  url: string;
  status: UptimeStatus;
  uptimePercentage: number;
  lastChecked: string;
  latestLatency: number;
  uptimeTicks: UptimeStatus[];
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
}

function getStatusText(status: UptimeStatus) {
  if (status === "good") return "Operational";
  if (status === "bad") return "Down";
  return "No data";
}

function statusTone(status: UptimeStatus) {
  if (status === "good") return { dot: "bg-signal", text: "text-signal", bar: "bg-signal" };
  if (status === "bad") {
    return { dot: "bg-destructive", text: "text-destructive", bar: "bg-destructive" };
  }
  return { dot: "bg-muted-foreground", text: "text-muted-foreground", bar: "bg-muted-foreground" };
}

function StatCard({
  label,
  value,
  caption,
  valueClassName,
}: {
  label: string;
  value: string;
  caption: string;
  valueClassName?: string;
}) {
  return (
    <div className="bg-surface px-6 py-7">
      <p className="eyebrow">{label}</p>
      <p className={cx("mt-4 font-mono text-4xl font-semibold tracking-tight tabular-nums",
        valueClassName,
      )}>
        {value}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{caption}</p>
    </div>
  );
}

function TickStrip({ ticks }: { ticks: UptimeStatus[] }) {
  return (
    <div className="flex gap-1">
      {ticks.map((tick, index) => (
        <span
          key={index}
          title={getStatusText(tick)}
          className={cx(
            "h-7 flex-1 rounded-[3px]",
            tick === "good" && "bg-signal/80",
            tick === "bad" && "bg-destructive/80",
            tick === "unknown" && "bg-muted",
          )}
        />
      ))}
    </div>
  );
}

function MiniStat({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className={cx("mt-2 font-mono text-sm", valueClassName)}>{value}</p>
    </div>
  );
}

function AddWebsiteModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: (url: string | null) => void;
}) {
  const [url, setUrl] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        aria-label="Close"
        onClick={() => onClose(null)}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="panel relative w-full max-w-md overflow-hidden p-7">
        <div className="pointer-events-none absolute inset-0 aurora opacity-40" />
        <div className="relative">
          <span className="eyebrow">New target</span>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">Add website</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The hub will assign this endpoint to the connected validators. Status is decided by
            majority agreement.
          </p>

          <label className="mt-7 block">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              URL
            </span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
              className="mt-2 w-full rounded-xl border border-input bg-background/60 px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-signal/60 focus:ring-2 focus:ring-ring" />
          </label>

          <div className="mt-7 flex items-center justify-end gap-3">
            <button
              onClick={() => onClose(null)}
              className="rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:border-signal/40 hover:text-foreground">
              Cancel
            </button>
            <button
              onClick={() => onClose(url)}
              className="group inline-flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-signal-foreground shadow-[var(--shadow-signal)] transition-all hover:brightness-105">
              Add website
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebsiteRow({ website }: { website: ProcessedWebsite }) {
  const [expanded, setExpanded] = useState(false);
  const hostname = getHostname(website.url);
  const tone = statusTone(website.status);

  return (
    <li>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full px-6 py-4 text-left transition-colors hover:bg-surface-raised">
        <div className="grid grid-cols-2 items-center gap-4 md:grid-cols-[1.5fr_0.9fr_1.1fr_0.8fr_0.8fr]">
          <div className="col-span-2 flex items-center gap-3 md:col-span-1">
            <span
              className={cx("size-2 shrink-0 rounded-full", tone.dot)}
              style={
                website.status === "good"
                  ? { animation: "atlas-pulse 2.6s ease-in-out infinite" }
                  : undefined
              } />

            <div className="min-w-0">
              <p className="truncate font-mono text-[13px] text-foreground">{hostname}</p>
              <p className="truncate font-mono text-[11px] text-muted-foreground">{website.url}</p>
            </div>
          </div>

          <span className={cx("font-mono text-[12px] uppercase tracking-[0.12em]", tone.text)}>
            {getStatusText(website.status)}
          </span>

          <div>
            <span className="font-mono text-[13px] tabular-nums">
              {website.uptimePercentage.toFixed(1)}%
            </span>
            <div className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-muted">
              <div
                className={cx("h-full rounded-full", tone.bar)}
                style={{ width: `${Math.max(0, Math.min(100, website.uptimePercentage))}%` }}
              />
            </div>
          </div>

          <span className="font-mono text-[13px] tabular-nums text-muted-foreground">
            {website.latestLatency > 0 ? `${website.latestLatency} ms` : "--"}
          </span>

          <span className="flex items-center justify-between gap-3 font-mono text-[13px] text-muted-foreground">
            {website.lastChecked}
            {expanded ? (
              <ChevronUp className="size-4 shrink-0" />
            ) : (
              <ChevronDown className="size-4 shrink-0" />
            )}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border bg-background/40 px-6 py-6">
          <div
            className="rounded-2xl border border-border bg-surface p-6"
            style={{ animation: "atlas-rise 320ms ease-out both" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="size-2 rounded-full bg-signal"
                  style={{ animation: "atlas-pulse 2s ease-in-out infinite" }}
                />
                <span className="eyebrow">Current consensus</span>
              </div>
              <span className="font-mono text-[11px] text-signal">LIVE</span>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Recent health checks
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Last 30 minutes
                </span>
              </div>
              <div className="mt-3">
                <TickStrip ticks={website.uptimeTicks} />
              </div>
            </div>

            <div className="mt-6 grid gap-3 border-t border-border pt-6 sm:grid-cols-3">
              <MiniStat
                label="Current status"
                value={getStatusText(website.status)}
                valueClassName={tone.text}/>
              <MiniStat
                label="Latest latency"
                value={website.latestLatency > 0 ? `${website.latestLatency} ms` : "--"} />
              <MiniStat label="Last checked" value={website.lastChecked} />
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

export default function DashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { websites, refreshWebsites } = useWebsites() as {
    websites: Website[];
    refreshWebsites: () => Promise<void>;
  };

  const { getToken } = useAuth();

  const processedWebsites = useMemo<ProcessedWebsite[]>(() => {
    return websites.map((website) => {
      const sortedChecks = [...website.rounds].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      const uptimeTicks: UptimeStatus[] = sortedChecks
        .slice(0, 10)
        .reverse()
        .map((check) =>
          check.status === "Good" ? "good" : check.status === "Bad" ? "bad" : "unknown",
        );

      while (uptimeTicks.length < 10) {
        uptimeTicks.unshift("unknown");
      }

      const totalChecks = sortedChecks.length;
      const goodChecks = sortedChecks.filter((check) => check.status === "Good").length;
      const uptimePercentage = totalChecks === 0 ? 100 : (goodChecks / totalChecks) * 100;

      const status: UptimeStatus =
        website.currentStatus === "Good"
          ? "good"
          : website.currentStatus === "Bad"
            ? "bad"
            : "unknown";

      return {
        id: website.id,
        url: website.url,
        status,
        uptimePercentage,
        lastChecked: website.lastCheckedAt
          ? new Date(website.lastCheckedAt).toLocaleTimeString()
          : "--",
        latestLatency: website.lastLatency ?? 0,
        uptimeTicks,
      };
    });
  }, [websites]);

  const stats = useMemo(() => {
    const total = processedWebsites.length;
    const healthy = processedWebsites.filter((site) => site.status === "good").length;
    const down = processedWebsites.filter((site) => site.status === "bad").length;
    const avgUptime =
      total === 0
        ? 0
        : processedWebsites.reduce((sum, site) => sum + site.uptimePercentage, 0) / total;

    return { total, healthy, down, avgUptime };
  }, [processedWebsites]);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="relative grid size-7 place-items-center rounded-md border border-signal/40 bg-signal/10">
              <span className="size-2 rounded-full bg-signal" />
            </span>
            <span className="font-display text-[15px] font-semibold tracking-tight">Atlas Uptime</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <span className="text-foreground">Monitors</span>
            <Link href="/#validators" className="transition-colors hover:text-foreground">Validators</Link>
            <Link href="/#architecture" className="transition-colors hover:text-foreground">Architecture</Link>
          </nav>

          <div className="flex items-center gap-2.5">

            <button
              onClick={() => setIsModalOpen(true)}
              className="group inline-flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-signal-foreground shadow-[var(--shadow-signal)] transition-all hover:brightness-105">Add website
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="relative">
        <div className="pointer-events-none absolute inset-0 aurora opacity-50" />
        <div className="pointer-events-none absolute inset-0 grid-field" />
        <section className="relative mx-auto w-full max-w-6xl px-6 pb-12 pt-14">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-signal/60" />
            <span className="eyebrow">Operations console</span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">Your targets, decided by validator agreement.</h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Every status below is the result the connected validators agreed on — not one blind
            check from a single vantage point.
          </p>
        </section>
      </div>

      <section className="mx-auto w-full max-w-6xl px-6 pb-12">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Monitors"
            value={String(stats.total)}
            caption="Targets assigned to the validator network" />
          <StatCard
            label="Operational"
            value={String(stats.healthy)}
            caption="Confirmed up by majority agreement"
            valueClassName="text-signal" />
          <StatCard
            label="Down"
            value={String(stats.down)}
            caption="Reported down by the reporting validators"
            valueClassName={stats.down > 0 ? "text-destructive" : undefined} />
          <StatCard
            label="Average uptime"
            value={`${stats.avgUptime.toFixed(1)}%`}
            caption="Across all monitored targets" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Monitored websites</span>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">
              Website monitoring
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Expand a row to see the recent signed health checks behind its current status.
          </p>
        </div>

        <div className="panel overflow-hidden">
          <div className="hidden grid-cols-[1.5fr_0.9fr_1.1fr_0.8fr_0.8fr] gap-4 border-b border-border px-6 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:grid">
            <span>Website</span>
            <span>Status</span>
            <span>Uptime</span>
            <span>Latency</span>
            <span>Last check</span>
          </div>

          {processedWebsites.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto max-w-md">
                <span className="eyebrow">No targets yet</span>
                <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
                  The network has nothing to watch.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Add an endpoint and the hub assigns it to every connected validator. Each one
                  probes it independently, signs the result, and the row below fills with status,
                  latency, and the checks that produced the decision.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group mt-7 inline-flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-signal-foreground shadow-[var(--shadow-signal)] transition-all hover:brightness-105">
                  <Plus className="size-4" /> Add first website
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {processedWebsites.map((website) => (
                <WebsiteRow key={website.id} website={website} />
              ))}
            </ul>
          )}
        </div>
      </section>

      <AddWebsiteModal
        isOpen={isModalOpen}
        onClose={async (url) => {
          if (url === null) {
            setIsModalOpen(false);
            return;
          }

          try {
            if (API_BACKEND_URL) {
              const token = await getToken();

              const res = await fetch(`${API_BACKEND_URL}/api/v1/website`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: "include",
                body: JSON.stringify({ url }),
              });

              if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to add website: ${res.status} ${text}`);
              }

              setIsModalOpen(false);
              await refreshWebsites();
            } else {
              setIsModalOpen(false);
            }
          } catch (error) {
            console.error(error);
            setIsModalOpen(false);
          }

        }}
      />
    </main>
  );
}