"use client";

import DashboardLayout from "@/src/components/layout/DashboardLayout"

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
