"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import {
  Menu,
  Search,
  Bell,
  Settings,
  User,
  Moon,
  Sun,
  Zap,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export function TopBar({ sidebarOpen, onSidebarToggle }: TopBarProps) {
  const { user, signOut } = useAuth();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 z-40 w-full"
    >
      <div className="glass border-b border-white/20">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              className="h-9 w-9 p-0 hover:bg-white/20 transition-all duration-300"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 bg-green-500/10 text-green-700 px-3 py-1.5 rounded-full"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+12.5%</span>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 bg-blue-500/10 text-blue-700 px-3 py-1.5 rounded-full"
              >
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">$2,847</span>
              </motion.div>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search transactions, bills, or insights..."
                className="pl-10 bg-white/10 border-white/20 focus:bg-white/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 p-0 hover:bg-white/20"
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs">
                  3
                </Badge>
              </Button>
            </motion.div>

            {/* Theme Toggle */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 hover:bg-white/20"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </motion.div>

            {/* Settings */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 hover:bg-white/20"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* User Profile */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 bg-white/10 rounded-full px-3 py-1.5 cursor-pointer hover:bg-white/20 transition-all duration-300"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500">Premium</p>
              </div>
              <Zap className="h-4 w-4 text-yellow-500" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}