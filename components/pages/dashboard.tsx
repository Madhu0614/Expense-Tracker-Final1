"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { expenseQueries, billQueries, subscriptionQueries } from "@/lib/supabase-queries";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Target,
  Zap,
  Sparkles,
  Activity,
  CreditCard,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

interface DashboardStats {
  monthlyExpense: number;
  budgetUsed: number;
  dailyAverage: number;
  savingsGoal: number;
}

interface RecentExpense {
  id: number;
  purpose: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
}

const categoryColors: { [key: string]: string } = {
  Food: "bg-red-100 text-red-800 border-red-200",
  Transport: "bg-blue-100 text-blue-800 border-blue-200",
  Entertainment: "bg-purple-100 text-purple-800 border-purple-200",
  Health: "bg-green-100 text-green-800 border-green-200",
  Education: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Shopping: "bg-pink-100 text-pink-800 border-pink-200",
  Utilities: "bg-orange-100 text-orange-800 border-orange-200",
  Other: "bg-gray-100 text-gray-800 border-gray-200",
};

export function Dashboard() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    monthlyExpense: 0,
    budgetUsed: 0,
    dailyAverage: 0,
    savingsGoal: 0,
  });
  const [recentExpenses, setRecentExpenses] = useState<RecentExpense[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, selectedPeriod]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      // Load monthly expenses
      const monthlyTotal = await expenseQueries.getMonthlyTotal(user.id, currentYear, currentMonth);
      
      // Load recent expenses
      const expenses = await expenseQueries.getRecentExpenses(user.id, 10);
      
      // Load upcoming bills
      const bills = await billQueries.getUpcoming(user.id, 7);
      
      // Calculate daily average (for current month)
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const currentDay = currentDate.getDate();
      const dailyAvg = monthlyTotal / currentDay;

      // Mock budget for now (you can add a budget table later)
      const budget = 4000;
      const budgetUsedPercentage = (monthlyTotal / budget) * 100;
      const savingsGoal = budget - monthlyTotal;

      setStats({
        monthlyExpense: monthlyTotal,
        budgetUsed: budgetUsedPercentage,
        dailyAverage: dailyAvg,
        savingsGoal: Math.max(0, savingsGoal),
      });

      setRecentExpenses(expenses);
      setUpcomingBills(bills);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Monthly Expense",
      value: `$${stats.monthlyExpense.toFixed(2)}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      description: "vs last month"
    },
    {
      title: "Budget Progress",
      value: `${Math.round(stats.budgetUsed)}%`,
      change: `$${stats.monthlyExpense.toFixed(2)} / $4,000`,
      trend: "neutral",
      icon: Target,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      description: `$${stats.savingsGoal.toFixed(2)} remaining`
    },
    {
      title: "Daily Average",
      value: `$${stats.dailyAverage.toFixed(2)}`,
      change: "+5.2%",
      trend: "up",
      icon: Activity,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      description: "this month"
    },
    {
      title: "Savings Goal",
      value: `$${stats.savingsGoal.toFixed(2)}`,
      change: `${Math.round((stats.savingsGoal / 4000) * 100)}% achieved`,
      trend: "up",
      icon: Sparkles,
      color: "from-amber-500 to-amber-600",
      bgColor: "from-amber-50 to-amber-100",
      description: "on track"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-4xl lg:text-5xl font-bold text-gradient">
                Financial Dashboard
              </h1>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-8 w-8 text-yellow-500" />
              </motion.div>
            </div>
            <p className="text-gray-600 text-lg">
              Welcome back! Here's your financial overview for {currentTime.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-white/20 rounded-2xl p-1">
              {["week", "month", "year"].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className={`capitalize ${selectedPeriod === period ? 'bg-white shadow-lg' : 'hover:bg-white/20'}`}
                >
                  {period}
                </Button>
              ))}
            </div>
            
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg btn-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.1,
              ease: [0.4, 0, 0.2, 1]
            }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group"
          >
            <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 card-hover">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-50`} />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
              
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                </div>
                <motion.div 
                  className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </motion.div>
              </CardHeader>
              
              <CardContent className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {stat.trend === "up" && (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    )}
                    {stat.trend === "down" && (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <p className={`text-sm font-medium ${
                      stat.trend === "up" ? "text-green-600" : 
                      stat.trend === "down" ? "text-red-600" : 
                      "text-gray-600"
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
                
                {stat.title === "Budget Progress" && (
                  <div className="mt-3">
                    <Progress value={Math.min(stats.budgetUsed, 100)} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { title: "View Analytics", icon: BarChart3, color: "from-purple-500 to-pink-500", href: "/analytics" },
          { title: "Manage Bills", icon: Calendar, color: "from-orange-500 to-red-500", href: "/bills" },
          { title: "Track Expenses", icon: PieChart, color: "from-green-500 to-emerald-500", href: "/expenses" },
        ].map((action, index) => (
          <motion.div
            key={action.title}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                  <action.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <Button variant="outline" size="sm" className="hover:bg-white/50">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced Recent Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Recent Transactions
                  </CardTitle>
                  <p className="text-sm text-gray-500">Your latest financial activities</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="hover:bg-gray-50">
                View All
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {recentExpenses.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent expenses found</p>
                  </div>
                ) : (
                  recentExpenses.map((expense, index) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      whileHover={{ backgroundColor: "rgba(0,0,0,0.02)", scale: 1.01 }}
                      className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden"
                          whileHover={{ scale: 1.1 }}
                        >
                          <span className="text-sm font-bold text-gray-600 z-10">
                            {expense.purpose.charAt(0)}
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-semibold text-gray-900">{expense.purpose}</h3>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <Badge 
                              variant="outline" 
                              className={`${categoryColors[expense.category] || "bg-gray-100 text-gray-800"} border-0`}
                            >
                              {expense.category}
                            </Badge>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(new Date(expense.date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <motion.p 
                          className="font-bold text-lg text-red-600"
                          whileHover={{ scale: 1.1 }}
                        >
                          ${Number(expense.amount).toFixed(2)}
                        </motion.p>
                        <p className="text-xs text-gray-500">Completed</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}