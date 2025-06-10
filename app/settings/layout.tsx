"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RouteGuard } from "components/route-guard";
import { cn } from "lib/utils";
import {
  ArrowLeft,
  Settings,
  User,
  Key,
  Shield,
  Palette,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "General",
      href: "/settings",
      icon: Settings,
      active: pathname === "/settings",
    },
    {
      name: "Profile",
      href: "/settings/profile",
      icon: User,
      active: pathname === "/settings/profile",
    },
    {
      name: "API Keys",
      href: "/settings/api-keys",
      icon: Key,
      active: pathname === "/settings/api-keys",
      disabled: true,
    },
    {
      name: "Appearance",
      href: "/settings/appearance",
      icon: Palette,
      active: pathname === "/settings/appearance",
      disabled: true,
    },
    {
      name: "Privacy",
      href: "/settings/privacy",
      icon: Shield,
      active: pathname === "/settings/privacy",
      disabled: true,
    },
    {
      name: "Notifications",
      href: "/settings/notifications",
      icon: Bell,
      active: pathname === "/settings/notifications",
      disabled: true,
    },
  ];

  return (
    <RouteGuard>
      <motion.div
        className="min-h-screen bg-background"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="container mx-auto max-w-7xl py-8 px-4">
          <div className="mb-6 flex items-center">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 mr-3 hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-semibold">Settings</h1>
          </div>

          <div className="flex flex-col gap-8 md:flex-row">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 shrink-0">
              <nav className="sticky top-8 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.disabled ? "#" : item.href}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                        item.active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        item.disabled &&
                          "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
                      )}
                      onClick={(e) => {
                        if (item.disabled) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      <span>{item.name}</span>
                      {item.disabled && (
                        <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                          Soon
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Main content */}
            <div className="flex-1">
              <div className="bg-background rounded-lg border border-border p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </RouteGuard>
  );
}
