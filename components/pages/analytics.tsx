"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { expenseQueries } from "@/lib/supabase-queries";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, AlertTriangle, Lightbulb, Target, Loader2 } from "lucide-react";

interface MonthlyData {
  name: string;
  expense: number;
  budget: number;
}

interface CategoryData {
  name: string;
  value: number;
  amount: number;
  color: string;
}

interface WeeklyTrend {
  day: string;
  amount: number;
}

const insights = [
  {
    type: "warning",
    icon: AlertTriangle,
    title: "High Food Spending",
    description: "You've spent 35% more on dining out compared to last month. Consider meal prepping to save money.",
    action: "Set a dining budget limit",
    color: "from-amber-500 to-orange-500",
  },
  {
    type: "tip",
    icon: Lightbulb,
    title: "Weekend Overspending",
    description: "Your weekend expenses are 40% higher than weekdays. Plan weekend activities within budget.",
    action: "Create weekend budget plan",
    color: "from-blue-500 to-indigo-500",
  },
  {
    type: "goal",
    icon: Target,
    title: "Budget Achievement",
    description: "You're on track to save $200 this month by staying within your transportation budget!",
    action: "Keep up the good work",
    color: "from-green-500 to-emerald-500",
  },
];

const categoryColors = [
  "#EF4444", "#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#6B7280"
];

export function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrend[]>([]);

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user]);

  const loadAnalyticsData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      // Load monthly data for the last 6 months
      const monthlyExpenses: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - 1 - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        const expense = await expenseQueries.getMonthlyTotal(user.id, year, month);
        monthlyExpenses.push({
          name: monthName,
          expense,
          budget: 3000 + (i * 200), // Mock budget data
        });
      }
      setMonthlyData(monthlyExpenses);

      // Load category breakdown for current month
      const categoryBreakdown = await expenseQueries.getCategoryBreakdown(user.id, currentYear, currentMonth);
      const total = categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0);
      
      const categoryDataWithPercentage = categoryBreakdown.map((cat, index) => ({
        name: cat.category,
        value: total > 0 ? Math.round((cat.amount / total) * 100) : 0,
        amount: cat.amount,
        color: categoryColors[index % categoryColors.length],
      }));
      setCategoryData(categoryDataWithPercentage);

      // Mock weekly trend data (you can enhance this with real data)
      const weeklyData: WeeklyTrend[] = [
        { day: "Mon", amount: 45 },
        { day: "Tue", amount: 89 },
        { day: "Wed", amount: 67 },
        { day: "Thu", amount: 123 },
        { day: "Fri", amount: 156 },
        { day: "Sat", amount: 98 },
        { day: "Sun", amount: 76 },
      ];
      setWeeklyTrend(weeklyData);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Analytics
        </h1>
        <p className="text-gray-600 mt-2">
          Gain insights into your spending patterns and optimize your budget.
        </p>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Expense vs Budget */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Monthly Expense vs Budget</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [`$${value}`, name === 'expense' ? 'Expense' : 'Budget']}
                  />
                  <Legend />
                  <Bar dataKey="budget" fill="#E5E7EB" name="Budget" />
                  <Bar dataKey="expense" fill="#3B82F6" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Weekly Spending Trend</CardTitle>
            <p className="text-sm text-gray-500">Daily average spending for the current week</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>AI-Powered Insights</CardTitle>
            <p className="text-sm text-gray-500">
              Smart recommendations based on your spending patterns
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md transition-all duration-300"
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${insight.color}`}>
                  <insight.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2">
                    {insight.action} →
                  </button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}