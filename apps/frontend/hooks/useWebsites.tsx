"use client";

import { API_BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";

interface Website {
  id: string;
  url: string;
  ticks: {
    id: string;
    createdAt: string;
    status: string;
    latency: number;
  }[];
}

export function useWebsites() {
  const { getToken } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);

  const refreshWebsites = useCallback(async () => {
    try {
      const token = await getToken();

      if (!token) {
        console.error("No Clerk token available");
        return;
      }

      const response = await axios.get(`${API_BACKEND_URL}/api/v1/websites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWebsites(response.data.websites ?? []);
    } catch (error) {
      console.error("Failed to fetch websites:", error);
    }
  }, [getToken]);

  useEffect(() => {
    refreshWebsites();

    const interval = setInterval(() => {
      refreshWebsites();
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, [refreshWebsites]);

  return { websites, refreshWebsites };
}