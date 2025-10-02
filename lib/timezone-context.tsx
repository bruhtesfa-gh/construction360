"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "./trpc";

interface TimezoneContextType {
  timezone: string;
  formatDate: (date: Date | string) => string;
  formatDateTime: (date: Date | string) => string;
  formatDateTimeWithSeconds: (date: Date | string) => string;
  isLoading: boolean;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(
  undefined
);

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [timezone, setTimezone] = useState<string>("UTC");

  // Get builder information to fetch timezone
  const builderId = session?.user?.builderId;

  const { data: builder, isLoading } = api.builders.getById.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  // Update timezone when builder data is loaded
  useEffect(() => {
    if (builder?.local_time_zone_name) {
      setTimezone(builder.local_time_zone_name);
    }
  }, [builder]);

  // Helper function to ensure we have a Date object
  const toDate = (date: Date | string): Date => {
    if (typeof date === "string") {
      return new Date(date);
    }
    return date;
  };

  // Date formatting functions that use the user's timezone
  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = toDate(date);
      return dateObj.toLocaleDateString("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.warn("Failed to format date:", error);
      return "Invalid Date";
    }
  };

  const formatDateTime = (date: Date | string): string => {
    try {
      const dateObj = toDate(date);
      return dateObj.toLocaleString("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.warn("Failed to format date time:", error);
      return "Invalid Date";
    }
  };

  const formatDateTimeWithSeconds = (date: Date | string): string => {
    try {
      const dateObj = toDate(date);
      return dateObj.toLocaleString("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      });
    } catch (error) {
      console.warn("Failed to format date time with seconds:", error);
      return "Invalid Date";
    }
  };

  const value: TimezoneContextType = {
    timezone,
    formatDate,
    formatDateTime,
    formatDateTimeWithSeconds,
    isLoading,
  };

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error("useTimezone must be used within a TimezoneProvider");
  }
  return context;
}

// Utility to convert local time to UTC for database storage
export function toUTC(date: Date | string): Date {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Date(dateObj.toISOString());
}

// Utility to create a new Date in UTC (for storing in database)
export function nowUTC(): Date {
  return new Date();
}
