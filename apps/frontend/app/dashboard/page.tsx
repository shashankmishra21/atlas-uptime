"use client";
import React, { useMemo, useState } from "react";
import axios from "axios";
import { Activity, ChevronDown, ChevronUp, Clock3, Globe, Moon, Plus, Sun } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useWebsites } from "@/hooks/useWebsites";
import { API_BACKEND_URL } from "@/config";

type UptimeStatus = "good" | "bad" | "unknown";

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

function getMonitorStatusClasses(status: UptimeStatus) {
  if (status === "good") {
    return {
      dot: "bg-emerald-400",
      text: "text-emerald-300",
      soft: "text-emerald-400",
    };
  }

  if (status === "bad") {
    return {
      dot: "bg-rose-400",
      text: "text-rose-300",
      soft: "text-rose-400",
    };
  }

  return {
    dot: "bg-zinc-500",
    text: "text-zinc-300",
    soft: "text-zinc-400",
  };
}

function StatusDot({ className }: { className: string }) {
  return <span className={cx("h-2.5 w-2.5 rounded-full", className)} />;
}

function UptimeStrip({ ticks }: { ticks: UptimeStatus[] }) {
  return (
    <div className="flex items-center gap-1">
      {ticks.map((tick, index) => (
        <div
          key={index}
          className={cx(
            "h-1.5 flex-1 rounded-full",
            tick === "good" && "bg-emerald-400",
            tick === "bad" && "bg-rose-400",
            tick === "unknown" && "bg-zinc-700"
          )}
        />
      ))}
    </div>
  );
}

function Metric({ label, value, hint, valueClassName }: {
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className={cx("text-2xl font-semibold tracking-tight text-zinc-100", valueClassName)}>
        {value}
      </p>
      {hint ? <p className="text-sm text-zinc-500">{hint}</p> : null}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md border border-zinc-800 bg-[#111214] p-6 shadow-2xl">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-zinc-100">Add website</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Add a public endpoint to the monitoring network.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full border border-zinc-700 bg-[#0d0e10] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => onClose(null)}
            className="border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            onClick={() => onClose(url)}
            className="bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-white"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function WebsiteRow({ website }: { website: ProcessedWebsite }) {
  const [expanded, setExpanded] = useState(false);
  const hostname = getHostname(website.url);
  const statusStyles = getMonitorStatusClasses(website.status);

  return (
    <div className="border-b border-zinc-900 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full px-4 py-4 text-left transition hover:bg-white/[0.02]"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2.4fr)_1fr_1fr_auto] lg:items-center">
          {/* Website */}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <StatusDot className={statusStyles.dot} />
              <p className="truncate text-sm font-medium text-zinc-100">
                {hostname}
              </p>
            </div>

            <p className="mt-1 truncate pl-[22px] text-sm text-zinc-500">
              {website.url}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600 lg:hidden">
              Status
            </p>

            <p className={cx("text-sm font-medium", statusStyles.text)}>
              {getStatusText(website.status)}
            </p>
          </div>

          {/* Uptime */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600 lg:hidden">
              Uptime
            </p>

            <p className="text-sm text-zinc-200">
              {website.uptimePercentage.toFixed(1)}%
            </p>
          </div>

          {/* Last Checked */}
          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <p className="text-sm text-zinc-500">
              {website.lastChecked}
            </p>

            <div className="text-zinc-500">
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-5">
          <div className="ml-[22px] border-l border-zinc-800 pl-5">

            {/* Health History */}
            <div className="max-w-xl">
              <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                <span>Recent Health Checks</span>
                <span>Last 30 Minutes</span>
              </div>

              <UptimeStrip ticks={website.uptimeTicks} />
            </div>

            {/* Details */}
            <div className="mt-5 grid gap-4 sm:grid-cols-3">

              <div className="rounded border border-zinc-800 bg-zinc-900/30 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Current Status
                </p>

                <p className={cx("mt-2 text-sm font-medium", statusStyles.soft)}>
                  {getStatusText(website.status)}
                </p>
              </div>

              <div className="rounded border border-zinc-800 bg-zinc-900/30 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Latest Latency
                </p>

                <p className="mt-2 text-sm text-zinc-200">
                  {website.latestLatency > 0
                    ? `${website.latestLatency} ms`
                    : "--"}
                </p>
              </div>

              <div className="rounded border border-zinc-800 bg-zinc-900/30 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Last Checked
                </p>

                <p className="mt-2 text-sm text-zinc-200">
                  {website.lastChecked}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { websites, refreshWebsites } = useWebsites();
  const { getToken } = useAuth();

  const processedWebsites = useMemo<ProcessedWebsite[]>(() => {
    return websites.map((website) => {
      const sortedTicks = [...website.ticks].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const recentTicks = sortedTicks.filter(
        (tick) => new Date(tick.createdAt) > thirtyMinutesAgo
      );

      const windows: UptimeStatus[] = [];

      for (let i = 0; i < 10; i++) {
        const windowStart = new Date(Date.now() - (i + 1) * 3 * 60 * 1000);
        const windowEnd = new Date(Date.now() - i * 3 * 60 * 1000);

        const windowTicks = recentTicks.filter((tick) => {
          const tickTime = new Date(tick.createdAt);
          return tickTime >= windowStart && tickTime < windowEnd;
        });

        const upTicks = windowTicks.filter((tick) => tick.status === "Good").length;

        windows[9 - i] =
          windowTicks.length === 0
            ? "unknown"
            : upTicks / windowTicks.length >= 0.5
              ? "good"
              : "bad";
      }

      const totalTicks = sortedTicks.length;
      const upTicks = sortedTicks.filter((tick) => tick.status === "Good").length;
      const uptimePercentage = totalTicks === 0 ? 100 : (upTicks / totalTicks) * 100;

      const currentStatus = windows[windows.length - 1];
      const lastChecked = sortedTicks[0]
        ? new Date(sortedTicks[0].createdAt).toLocaleTimeString()
        : "--";
      const latestLatency = sortedTicks[0]?.latency ?? null;

      return {
        id: website.id,
        url: website.url,
        status: currentStatus,
        uptimePercentage,
        lastChecked,
        latestLatency,
        uptimeTicks: windows,
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

    return { total, healthy, down, avgUptime, };
  }, [processedWebsites]);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-zinc-900 pb-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-zinc-500">
                <Activity className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.18em]">
                  Distributed monitoring
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
                Atlas Uptime
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Monitor website availability and uptime using distributed validator checks.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="border border-zinc-800 p-2.5 text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white"
              >
                <Plus className="h-4 w-4" />
                Add website
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-8 border-b border-zinc-900 py-8 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Monitors" value={String(stats.total)} />
          <Metric label="Operational" value={String(stats.healthy)} />
          <Metric
            label="Down"
            value={String(stats.down)}
            valueClassName={stats.down > 0 ? "text-rose-300" : "text-zinc-100"}
          />
          <Metric label="Average uptime" value={`${stats.avgUptime.toFixed(1)}%`} />
        </section>

        <section className="py-8">
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Monitored websites
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-100">Website Monitoring</h2>
          </div>

          <div className="mb-4 hidden grid-cols-[minmax(0,2.2fr)_0.9fr_0.9fr_0.9fr_auto] gap-4 border-b border-zinc-900 pb-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600 lg:grid">
            <div>Website</div>
            <div>Status</div>
            <div>Uptime</div>
            <div>Last check</div>
          </div>

          {processedWebsites.length === 0 ? (
            <div className="border border-dashed border-zinc-800 px-6 py-12 text-center">
              <h3 className="text-lg font-medium text-zinc-100">No websites yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
                Add a website to start tracking validator-backed uptime checks.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white"
              >
                <Plus className="h-4 w-4" />
                Add first website
              </button>
            </div>
          ) : (
            <div className="border border-zinc-900">
              {processedWebsites.map((website) => (
                <WebsiteRow key={website.id} website={website} />
              ))}
            </div>
          )}
        </section>

      </div>

      <AddWebsiteModal
        isOpen={isModalOpen}
        onClose={async (url) => {
          if (url === null) {
            setIsModalOpen(false);
            return;
          }

          try {
            const token = await getToken();

            await axios.post(
              `${API_BACKEND_URL}/api/v1/website`,
              { url },
              {
                headers: {
                  Authorization: token,
                },
              }
            );

            setIsModalOpen(false);
            refreshWebsites();
          } catch (error) {
            console.error(error);
            setIsModalOpen(false);
          }
        }}
      />
    </div>
  );
}