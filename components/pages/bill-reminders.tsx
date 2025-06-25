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
import { billQueries } from "@/lib/supabase-queries";
import {
  Plus,
  Bell,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Edit3,
  Loader2
} from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";

interface BillReminder {
  id: number;
  user_id: string;
  name: string;
  amount: number;
  due_date: string;
  frequency: "monthly" | "yearly" | "weekly" | "quarterly";
  category: string;
  is_active: boolean;
  last_paid?: string;
  created_at: string;
}

const categories = ["Housing", "Utilities", "Insurance", "Entertainment", "Healthcare", "Other"];
const frequencies = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

const categoryColors: { [key: string]: string } = {
  Housing: "bg-blue-100 text-blue-800 border-blue-200",
  Utilities: "bg-green-100 text-green-800 border-green-200",
  Insurance: "bg-purple-100 text-purple-800 border-purple-200",
  Entertainment: "bg-pink-100 text-pink-800 border-pink-200",
  Healthcare: "bg-red-100 text-red-800 border-red-200",
  Other: "bg-gray-100 text-gray-800 border-gray-200",
};

export function BillReminders() {
  const { user } = useAuth();
  const [bills, setBills] = useState<BillReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBill, setNewBill] = useState({
    name: "",
    amount: "",
    due_date: "",
    frequency: "",
    category: "",
  });

  useEffect(() => {
    if (user) {
      loadBills();
    }
  }, [user]);

  const loadBills = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await billQueries.getAll(user.id);
      setBills(data);
    } catch (error) {
      console.error('Error loading bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    return differenceInDays(parseISO(dueDate), new Date());
  };

  const getStatusColor = (daysUntil: number) => {
    if (daysUntil < 0) return "bg-red-100 text-red-800 border-red-200";
    if (daysUntil <= 3) return "bg-amber-100 text-amber-800 border-amber-200";
    if (daysUntil <= 7) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getStatusIcon = (daysUntil: number) => {
    if (daysUntil < 0) return AlertTriangle;
    if (daysUntil <= 3) return Clock;
    return CheckCircle;
  };

  const sortedBills = [...bills].sort((a, b) => {
    const daysA = getDaysUntilDue(a.due_date);
    const daysB = getDaysUntilDue(b.due_date);
    return daysA - daysB;
  });

  const upcomingBills = sortedBills.filter(bill => getDaysUntilDue(bill.due_date) <= 7 && bill.is_active);
  const overdueBills = sortedBills.filter(bill => getDaysUntilDue(bill.due_date) < 0 && bill.is_active);

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newBill.name || !newBill.amount || !newBill.due_date || !newBill.frequency || !newBill.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const billData = {
        user_id: user.id,
        name: newBill.name,
        amount: parseFloat(newBill.amount),
        due_date: newBill.due_date,
        frequency: newBill.frequency as any,
        category: newBill.category,
        is_active: true,
      };

      const createdBill = await billQueries.create(billData);
      setBills([...bills, createdBill]);
      setNewBill({ name: "", amount: "", due_date: "", frequency: "", category: "" });
      setIsDialogOpen(false);
      toast.success("Bill reminder added successfully!");
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error("Failed to add bill reminder");
    }
  };

  const toggleBillStatus = async (id: number) => {
    try {
      const bill = bills.find(b => b.id === id);
      if (!bill) return;

      const updatedBill = await billQueries.update(id, { is_active: !bill.is_active });
      setBills(bills.map(b => b.id === id ? updatedBill : b));
      toast.success("Bill status updated!");
    } catch (error) {
      console.error('Error updating bill:', error);
      toast.error("Failed to update bill status");
    }
  };

  const deleteBill = async (id: number) => {
    try {
      await billQueries.delete(id);
      setBills(bills.filter(bill => bill.id !== id));
      toast.success("Bill reminder deleted!");
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast.error("Failed to delete bill reminder");
    }
  };

  const markAsPaid = async (id: number) => {
    try {
      const updatedBill = await billQueries.update(id, { 
        last_paid: format(new Date(), 'yyyy-MM-dd') 
      });
      setBills(bills.map(b => b.id === id ? updatedBill : b));
      toast.success("Bill marked as paid!");
    } catch (error) {
      console.error('Error marking bill as paid:', error);
      toast.error("Failed to mark bill as paid");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-600">Loading bills...</span>
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
            Bill Reminders
          </h1>
          <p className="text-gray-600 mt-2">Never miss a payment with smart reminders</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Bill Reminder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBill} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Bill Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Electricity Bill"
                  value={newBill.name}
                  onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
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
                    value={newBill.amount}
                    onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newBill.due_date}
                    onChange={(e) => setNewBill({ ...newBill, due_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select value={newBill.frequency} onValueChange={(value) => setNewBill({ ...newBill, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newBill.category} onValueChange={(value) => setNewBill({ ...newBill, category: value })}>
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
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600">
                  Add Bill
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Overdue Bills</p>
                  <p className="text-2xl font-bold text-red-700">{overdueBills.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Due This Week</p>
                  <p className="text-2xl font-bold text-amber-700">{upcomingBills.length}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Monthly</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ${bills.filter(b => b.frequency === 'monthly' && b.is_active).reduce((sum, b) => sum + Number(b.amount), 0).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bills List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <span>All Bill Reminders ({bills.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {sortedBills.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No bill reminders found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {sortedBills.map((bill, index) => {
                  const daysUntil = getDaysUntilDue(bill.due_date);
                  const StatusIcon = getStatusIcon(daysUntil);
                  
                  return (
                    <motion.div
                      key={bill.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <StatusIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{bill.name}</h3>
                            <Badge 
                              variant="outline" 
                              className={categoryColors[bill.category] || categoryColors.Other}
                            >
                              {bill.category}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {bill.frequency}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {Number(bill.amount).toFixed(2)}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Due: {format(parseISO(bill.due_date), 'MMM dd, yyyy')}
                            </span>
                            {bill.last_paid && (
                              <span className="text-green-600">
                                Last paid: {format(parseISO(bill.last_paid), 'MMM dd')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(daysUntil)}
                        >
                          {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : 
                           daysUntil === 0 ? 'Due today' : 
                           `${daysUntil} days left`}
                        </Badge>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={bill.is_active}
                            onCheckedChange={() => toggleBillStatus(bill.id)}
                          />
                          <span className="text-xs text-gray-500">
                            {bill.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsPaid(bill.id)}
                            className="h-8 px-3"
                          >
                            Mark Paid
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            onClick={() => deleteBill(bill.id)}
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