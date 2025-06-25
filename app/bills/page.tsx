"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { BillReminders } from "@/components/pages/bill-reminders";

export default function BillsPage() {
  return (
    <AppLayout>
      <BillReminders />
    </AppLayout>
  );
}