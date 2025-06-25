"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { subscriptionQueries } from "@/lib/supabase-queries";
import {
  Plus,
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  Pause,
  Play,
  Trash2,
  Edit3,
  AlertCircle,
  Loader2
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

interface Subscription {
  id: number;
  user_id: string;
  name: string;
  amount: number;
  billing_cycle: "monthly" | "yearly" | "weekly";
  next_payment: string;
  category: string;
  is_active: boolean;
  description?: string;
  color: string;
  created_at: string;
}

const categories = ["Entertainment", "Productivity", "Fitness", "Education", "Shopping", "Other"];
const billingCycles = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const categoryColors: { [key: string]: string } = {
  Entertainment: "bg-purple-100 text-purple-800 border-purple-200",
  Productivity: "bg-blue-100 text-blue-800 border-blue-200",
  Fitness: "bg-green-100 text-green-800 border-green-200",
  Education: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Shopping: "bg-orange-100 text-orange-800 border-orange-200",
  Other: "bg-gray-100 text-gray-800 border-gray-200",
};

export function Subscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    name: "",
    amount: "",
    billing_cycle: "",
    next_payment: "",
    category: "",
    description: "",
  });

  useEffect(() => {
    if (user) {
      loadSubscriptions();
    }
  }, [user]);

  const loadSubscriptions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await subscriptionQueries.getAll(user.id);
      setSubscriptions(data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const activeSubscriptions = subscriptions.filter(sub => sub.is_active);
  const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
    const monthlyAmount = sub.billing_cycle === "yearly" ? Number(sub.amount) / 12 : 
                         sub.billing_cycle === "weekly" ? Number(sub.amount) * 4.33 : 
                         Number(sub.amount);
    return total + monthlyAmount;
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  const getDaysUntilPayment = (nextPayment: string) => {
    return differenceInDays(parseISO(nextPayment), new Date());
  };

  const upcomingPayments = activeSubscriptions
    .filter(sub => getDaysUntilPayment(sub.next_payment) <= 7)
    .sort((a, b) => getDaysUntilPayment(a.next_payment) - getDaysUntilPayment(b.next_payment));

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newSubscription.name || !newSubscription.amount || !newSubscription.billing_cycle || 
        !newSubscription.next_payment || !newSubscription.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const subscriptionData = {
        user_id: user.id,
        name: newSubscription.name,
        amount: parseFloat(newSubscription.amount),
        billing_cycle: newSubscription.billing_cycle as any,
        next_payment: newSubscription.next_payment,
        category: newSubscription.category,
        is_active: true,
        description: newSubscription.description || null,
        color: "#3B82F6",
      };

      const createdSubscription = await subscriptionQueries.create(subscriptionData);
      setSubscriptions([...subscriptions, createdSubscription]);
      setNewSubscription({ name: "", amount: "", billing_cycle: "", next_payment: "", category: "", description: "" });
      setIsDialogOpen(false);
      toast.success("Subscription added successfully!");
    } catch (error) {
      console.error('Error adding subscription:', error);
      toast.error("Failed to add subscription");
    }
  };

  const toggleSubscriptionStatus = async (id: number) => {
    try {
      const subscription = subscriptions.find(s => s.id === id);
      if (!subscription) return;

      const updatedSubscription = await subscriptionQueries.update(id, { 
        is_active: !subscription.is_active 
      });
      setSubscriptions(subscriptions.map(s => s.id === id ? updatedSubscription : s));
      toast.success("Subscription status updated!");
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error("Failed to update subscription status");
    }
  };

  const deleteSubscription = async (id: number) => {
    try {
      await subscriptionQueries.delete(id);
      setSubscriptions(subscriptions.filter(sub => sub.id !== id));
      toast.success("Subscription deleted!");
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error("Failed to delete subscription");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-600">Loading subscriptions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Subscriptions
          </h1>
          <p className="text-gray-600 mt-2">Manage all your recurring subscriptions in one place</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Subscription</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubscription} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Netflix"
                  value={newSubscription.name}
                  onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newSubscription.amount}
                    onChange={(e) => setNewSubscription({ ...newSubscription, amount: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="billing_cycle">Billing Cycle *</Label>
                  <Select value={newSubscription.billing_cycle} onValueChange={(value) => setNewSubscription({ ...newSubscription, billing_cycle: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      {billingCycles.map((cycle) => (
                        <SelectItem key={cycle.value} value={cycle.value}>
                          {cycle.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="next_payment">Next Payment *</Label>
                  <Input
                    id="next_payment"
                    type="date"
                    value={newSubscription.next_payment}
                    onChange={(e) => setNewSubscription({ ...newSubscription, next_payment: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newSubscription.category} onValueChange={(value) => setNewSubscription({ ...newSubscription, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Brief description"
                  value={newSubscription.description}
                  onChange={(e) => setNewSubscription({ ...newSubscription, description: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600">
                  Add Subscription
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Active</p>
                  <p className="text-2xl font-bold text-blue-700">{activeSubscriptions.length}</p>
                </div>
                <Play className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Monthly Total</p>
                  <p className="text-2xl font-bold text-green-700">${monthlyTotal.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Yearly Total</p>
                  <p className="text-2xl font-bold text-purple-700">${yearlyTotal.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Due This Week</p>
                  <p className="text-2xl font-bold text-amber-700">{upcomingPayments.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-amber-700">
                <AlertCircle className="h-5 w-5" />
                <span>Upcoming Payments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPayments.map((sub) => {
                  const daysUntil = getDaysUntilPayment(sub.next_payment);
                  return (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: sub.color }}
                        >
                          {sub.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{sub.name}</p>
                          <p className="text-sm text-gray-500">
                            {daysUntil === 0 ? 'Due today' : 
                             daysUntil === 1 ? 'Due tomorrow' : 
                             `Due in ${daysUntil} days`}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">${Number(sub.amount).toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Subscriptions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span>All Subscriptions ({subscriptions.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {subscriptions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No subscriptions found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {subscriptions.map((subscription, index) => {
                  const daysUntil = getDaysUntilPayment(subscription.next_payment);
                  
                  return (
                    <motion.div
                      key={subscription.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: subscription.color }}
                        >
                          {subscription.name.charAt(0)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{subscription.name}</h3>
                            <Badge 
                              variant="outline" 
                              className={categoryColors[subscription.category] || categoryColors.Other}
                            >
                              {subscription.category}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {subscription.billing_cycle}
                            </Badge>
                            {!subscription.is_active && (
                              <Badge variant="outline" className="bg-gray-100 text-gray-600">
                                Paused
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {Number(subscription.amount).toFixed(2)}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Next: {format(parseISO(subscription.next_payment), 'MMM dd, yyyy')}
                            </span>
                            {subscription.description && (
                              <span className="text-gray-400">• {subscription.description}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {subscription.is_active && (
                          <span className="text-sm text-gray-500">
                            {daysUntil <= 0 ? 'Due now' : `${daysUntil} days`}
                          </span>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={subscription.is_active}
                            onCheckedChange={() => toggleSubscriptionStatus(subscription.id)}
                          />
                          <span className="text-xs text-gray-500">
                            {subscription.is_active ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            onClick={() => deleteSubscription(subscription.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}