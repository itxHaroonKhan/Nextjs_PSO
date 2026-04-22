"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          {/* Mobile Header with Sidebar Trigger */}
          <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 h-14 lg:hidden">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <span className="font-semibold text-sm">Elites POS</span>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto overflow-x-visible">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
