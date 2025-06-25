"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { ExpenseList } from "@/components/pages/expense-list";

export default function ExpensesPage() {
  return (
    <AppLayout>
      <ExpenseList />
    </AppLayout>
  );
}