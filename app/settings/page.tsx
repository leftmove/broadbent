"use client";

import { Button } from "components/ui/button";
import { RouteGuard } from "components/route-guard";
import { ThemeToggle } from "components/theme-toggle";
import { Palette } from "lucide-react";
import React from "react";
import { cn } from "lib/utils";

export default function SettingsPage() {
  return (
    <RouteGuard>
      <div className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Appearance</h2>
          <p className="text-sm text-muted-foreground">
            Customize the app's appearance and theme.
          </p>
        </div>

        {/* Theme Settings */}
        <div className="p-6 border rounded-lg shadow-sm bg-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-medium flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-primary" />
                  Appearance
                </h3>
                <p className="text-sm text-muted-foreground">
                  Customize the app's appearance
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="space-y-0.5">
                <h4 className="text-base font-medium">Theme</h4>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark theme
                </p>
              </div>
              <div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
