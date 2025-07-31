"use client";
import React from "react";

export default function AuditTimeline({ logs }) {
  if (!logs.length) return <div className="text-gray-500">Brak historii.</div>;
  return (
    <ol className="border-l-2 border-blue-400 pl-4 space-y-4">
      {logs.map((log, idx) => (
        <li key={log._id || idx} className="relative">
          <span className="absolute -left-2.5 top-2 w-3 h-3 bg-blue-400 rounded-full" />
          <div>
            <span className="text-xs text-gray-500">
              {new Date(log.timestamp || log.createdAt).toLocaleString("pl-PL")}
            </span>
            <span className="ml-2 font-medium">
              {log.user?.firstName} {log.user?.lastName}
            </span>{" "}
            <span className="text-sm text-gray-500">
              ({log.action || log.type})
            </span>
            <div className="mt-1 text-gray-700 text-sm">
              {log.details || log.description}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
