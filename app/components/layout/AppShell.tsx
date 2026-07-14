"use client";

import type { ReactNode } from "react";
import { Code2, Loader2, LogOut, RefreshCcw } from "lucide-react";
import { signOut } from "next-auth/react";

import type { TabKey } from "../dashboard/types";
import { navItems } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

type ShellUser = {
  name: string;
  leetcodeUsername: string;
  codeforcesUsername: string;
  image?: string | null;
};

export function AppShell({
  activeTab,
  onTabChange,
  isLoading,
  onRefresh,
  user,
  children,
}: {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  isLoading: boolean;
  onRefresh: () => void;
  user: ShellUser;
  children: ReactNode;
}) {
  const current = navItems.find((item) => item.key === activeTab) ?? navItems[0];
  const initials = (user.name || user.leetcodeUsername || "CP").slice(0, 2).toUpperCase();

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-brand">
          <span className="rail-logo"><Code2 size={18} /></span>
          <div>
            <strong>CP Companion</strong>
            <span>Command Center</span>
          </div>
        </div>

        <nav className="topbar-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`rail-link${item.key === activeTab ? " active" : ""}`}
              onClick={() => onTabChange(item.key)}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="topbar-actions">
          <button
            type="button"
            className={`icon-btn${isLoading ? " is-busy" : ""}`}
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh data"
            title="Refresh data"
          >
            {isLoading ? <Loader2 size={18} /> : <RefreshCcw size={18} />}
          </button>
          <ThemeToggle />
          <div className="user-chip">
            <span className="avatar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {user.image ? <img src={user.image} alt="" style={{ width: "100%", height: "100%", borderRadius: 999, objectFit: "cover" }} /> : initials}
            </span>
            <div className="meta">
              <strong>{user.name || user.leetcodeUsername}</strong>
              <span>{user.codeforcesUsername} · {user.leetcodeUsername}</span>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => signOut({ callbackUrl: "/signin" })}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="stage">
        <div className="stage-head">
          <div className="stage-title">
            <span className="eyebrow">{current.eyebrow}</span>
            <h1>{current.title}</h1>
          </div>
        </div>

        <div className="stage-body">{children}</div>

        <nav className="dock">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`dock-link${item.key === activeTab ? " active" : ""}`}
              onClick={() => onTabChange(item.key)}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
