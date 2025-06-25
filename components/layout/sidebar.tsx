"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Receipt,
  Bell,
  CreditCard,
  Settings,
  X,
  Wallet,
  Sparkles,
  TrendingUp,
  Calendar,
  Target,
  Shield,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { 
    name: "Dashboard", 
    href: "/", 
    icon: LayoutDashboard,
    color: "from-blue-500 to-cyan-500",
    description: "Overview & insights"
  },
  { 
    name: "Analytics", 
    href: "/analytics", 
    icon: BarChart3,
    color: "from-purple-500 to-pink-500",
    description: "Deep insights & trends"
  },
  { 
    name: "Expenses", 
    href: "/expenses", 
    icon: Receipt,
    color: "from-green-500 to-emerald-500",
    description: "Track all expenses"
  },
  { 
    name: "Bill Reminders", 
    href: "/bills", 
    icon: Bell,
    color: "from-orange-500 to-red-500",
    description: "Never miss payments",
    badge: "3"
  },
  { 
    name: "Subscriptions", 
    href: "/subscriptions", 
    icon: CreditCard,
    color: "from-indigo-500 to-purple-500",
    description: "Manage recurring bills"
  },
  { 
    name: "Settings", 
    href: "/settings", 
    icon: Settings,
    color: "from-gray-500 to-slate-500",
    description: "Preferences & account"
  },
];

const quickActions = [
  { name: "Add Expense", icon: Receipt, color: "bg-green-500" },
  { name: "Set Budget", icon: Target, color: "bg-blue-500" },
  { name: "Pay Bill", icon: Calendar, color: "bg-orange-500" },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <motion.div
      className="fixed left-0 top-0 z-50 h-screen w-80 glass border-r border-white/20"
      initial={{ x: -320 }}
      animate={{ x: isOpen ? 0 : -320 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.4, 0, 0.2, 1],
        type: "tween"
      }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center pulse-glow">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse">
                <Sparkles className="w-2 h-2 text-white m-0.5" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">
                ExpenseFlow
              </h1>
              <p className="text-xs text-gray-500 flex items-center">
                <Zap className="w-3 h-3 mr-1 text-yellow-500" />
                Premium Suite
              </p>
            </div>
          </motion.div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0 hover:bg-white/20 lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="p-6 border-b border-white/10"
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Monthly Budget</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">$2,847 / $4,000</span>
                <span className="font-semibold text-blue-600">71%</span>
              </div>
              <Progress value={71} className="h-2" />
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                >
                  <button
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "group relative flex w-full items-center rounded-2xl px-4 py-4 text-sm font-medium transition-all duration-300",
                      "hover:bg-white/10 hover:scale-[1.02]",
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-blue-500/25`
                        : "text-gray-700 hover:text-gray-900"
                    )}
                  >
                    <div className={cn(
                      "mr-4 p-2 rounded-xl transition-all duration-300",
                      isActive 
                        ? "bg-white/20" 
                        : "bg-gray-100 group-hover:bg-white/20"
                    )}>
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-all duration-300",
                          isActive ? "text-white" : "text-gray-600 group-hover:text-gray-800"
                        )}
                      />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{item.name}</span>
                        {item.badge && (
                          <Badge className="ml-2 bg-red-500 text-white text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs mt-0.5 transition-colors duration-300",
                        isActive ? "text-white/80" : "text-gray-500"
                      )}>
                        {item.description}
                      </p>
                    </div>
                    
                    {isActive && (
                      <motion.div
                        className="absolute right-2 w-2 h-8 bg-white rounded-full"
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-8"
          >
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  <div className={cn("p-2 rounded-lg", action.color)}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{action.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </nav>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="p-4 border-t border-white/10"
        >
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Premium Active</p>
                <p className="text-xs text-gray-500">Advanced features unlocked</p>
              </div>
            </div>
            <Button className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white btn-glow">
              Manage Plan
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}