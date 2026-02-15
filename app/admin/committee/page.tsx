"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Shield, UserCog, ArrowLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Committee {
  id: number
  name: string
  email: string
  username: string
  is_active: boolean
  created_at: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
}

export default function CommitteeManagement() {
  const [committee, setCommittee] = useState<Committee[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Committee | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth")
    const adminData = JSON.parse(localStorage.getItem("adminData") || "{}")

    if (!adminAuth) {
      router.push("/admin/login")
      return
    }

    if (adminData.role !== "super_admin") {
      router.push("/admin/dashboard")
      return
    }

    fetchData(adminAuth)
  }, [router])

  const fetchData = async (token: string) => {
    try {
      const response = await fetch("/api/admin/committee", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()

      if (data.success) {
        setCommittee(data.committee)
      }
    } catch (error) {
      console.error("Failed to fetch committee:", error)
      toast({ title: "Error", description: "Failed to fetch committee data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("adminAuth")
    if (!token) return

    setSubmitting(true)
    try {
      const url = editingUser ? `/api/admin/committee/${editingUser.id}` : "/api/admin/committee"
      const method = editingUser ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({ title: "Success", description: editingUser ? "Committee user updated" : "Committee user created" })
        setIsDialogOpen(false)
        resetForm()
        fetchData(token)
      } else {
        toast({ title: "Error", description: data.message || "Failed to save committee user", variant: "destructive" })
      }
    } catch (error) {
      console.error("Failed to save committee user:", error)
      toast({ title: "Error", description: "Failed to save committee user", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this committee user?")) return

    const token = localStorage.getItem("adminAuth")
    if (!token) return

    try {
      const response = await fetch(`/api/admin/committee/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()

      if (data.success) {
        toast({ title: "Success", description: "Committee user deleted" })
        fetchData(token)
      } else {
        toast({ title: "Error", description: data.message || "Failed to delete committee user", variant: "destructive" })
      }
    } catch (error) {
      console.error("Failed to delete committee user:", error)
      toast({ title: "Error", description: "Failed to delete committee user", variant: "destructive" })
    }
  }

  const openCreateDialog = () => {
    resetForm()
    setEditingUser(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (user: Committee) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      password: "",
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      username: "",
      password: "",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-black">
        <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-gray-100 transition-colors duration-500">
      
      {/* Background Ambience & Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:hidden" />
        <div className="hidden dark:block absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="hidden dark:block absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[150px]" />
        <div className="hidden dark:block absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[150px]" />
      </div>

      <motion.div 
        className="container relative z-10 mx-auto px-4 sm:px-6 py-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* --- Header Section --- */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 mb-2">
                 <Button 
                    onClick={() => router.push("/admin/dashboard")} 
                    variant="ghost" 
                    size="sm" 
                    className="pl-0 hover:bg-transparent hover:text-indigo-600 dark:hover:text-indigo-400"
                 >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                 </Button>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:via-gray-200 dark:to-gray-500 bg-clip-text text-transparent flex items-center gap-3">
              <UserCog className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              Committee Management
            </h1>
            <p className="text-lg text-muted-foreground dark:text-gray-400">
              Create and manage committee users
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                    <Plus className="w-4 h-4" /> Add Committee User
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? "Edit Committee User" : "Create New Committee User"}</DialogTitle>
                        <DialogDescription>
                            {editingUser ? "Update committee user details" : "Create a new committee user account"}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password {editingUser && "(Leave blank to keep current)"}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={!editingUser}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : (editingUser ? "Update" : "Create")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* --- Committee List Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {committee.length === 0 ? (
                <motion.div variants={itemVariants} className="col-span-full">
                    <Card className="bg-white/70 dark:bg-zinc-950/40 border-slate-200 dark:border-white/10 backdrop-blur-md">
                        <CardContent className="p-12 text-center">
                            <UserCog className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground">No committee users created yet. Create one to get started.</p>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                committee.map((user) => (
                    <motion.div variants={itemVariants} key={user.id}>
                        <Card className="bg-white/70 dark:bg-zinc-950/40 border-slate-200 dark:border-white/10 backdrop-blur-md hover:border-purple-400 dark:hover:border-purple-600 transition-all group h-full flex flex-col">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-white/5">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                            <UserCog className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{user.name}</CardTitle>
                                            <CardDescription className="text-xs mt-1">{user.email}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant={user.is_active ? "default" : "secondary"} className={cn("capitalize", user.is_active ? "bg-emerald-600" : "")}>
                                        {user.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 flex-1 flex flex-col">
                                <div className="space-y-2 flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Username:</p>
                                    <p className="text-sm font-mono bg-slate-50 dark:bg-white/5 p-2 rounded">{user.username}</p>
                                </div>

                                <div className="text-xs text-muted-foreground mt-2">
                                    Created {new Date(user.created_at).toLocaleDateString()}
                                </div>
                                
                                <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))
            )}
        </div>
      </motion.div>
    </div>
  )
}
