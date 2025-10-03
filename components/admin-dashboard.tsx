"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { debugLog } from "@/lib/debug"
import {
  Users,
  Server,
  Search,
  UserPlus,
  Mail,
  Trash2,
  Edit,
  Shield,
  AlertTriangle,
  Phone,
  Building,
  Calendar,
  MapPin,
  Globe,
} from "lucide-react"
import AdminActivityMonitor from "./admin-activity-monitor"
import { getTranslation, languages } from "@/lib/i18n"
import { Settings, User, LogOut } from "lucide-react" // Importing undeclared variables
import { updateUserRole } from "@/app/actions/admin-actions"

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  phone: string | null
  username: string | null
  address: string | null
  city: string | null
  district: string | null
  company_name: string | null
  company_address: string | null
  company_tax_number: string | null
  company_website: string | null
  account_type: string | null
}

interface Instance {
  id: string
  user_id: string
  instance_name: string
  instance_key: string
  status: string
  workflow_id: string | null
  workflow_name: string | null
  created_at: string
  user_email: string
  user_full_name: string | null
  user_role: string
}

interface AdminDashboardProps {
  users: Profile[]
  instances: Instance[]
  currentUser: any
}

export function AdminDashboard({ users, instances, currentUser }: AdminDashboardProps) {
  const [language, setLanguage] = useState("tr")
  const t = getTranslation(language)

  const [selectedUsers, setSelectedUsers] = useState<Profile[]>(users)
  const [selectedInstances, setSelectedInstances] = useState<Instance[]>(instances)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  // Removed isEditUserOpen, editingUser, and handleEditDialogChange, handleCloseEditDialog, handleEditUser logic for editing directly in the component.
  const [isViewUserOpen, setIsViewUserOpen] = useState(false)
  const [viewingUser, setViewingUser] = useState<Profile | null>(null)
  const [newUser, setNewUser] = useState({ email: "", fullName: "", role: "user", password: "" })
  const router = useRouter()
  const supabase = createClient()

  // The useRef for dialog opening is no longer needed as edit dialog is removed.
  // const isOpeningDialogRef = useRef(false)

  // Removed handleEditDialogChange function.

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleProfile = () => {
    router.push("/profile")
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const result = await updateUserRole(userId, newRole)

      if (result.error) {
        debugLog("Error updating role:", result.error)
        alert("Rol güncellenirken hata oluştu: " + result.error)
        return
      }

      setSelectedUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
      alert(t.userUpdated)
    } catch (error) {
      debugLog("Error updating role:", error)
      alert("Rol güncellenirken beklenmeyen bir hata oluştu")
    }
  }

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    const userInstances = selectedInstances.filter((instance) => instance.user_id === userId)
    const confirmMessage =
      userInstances.length > 0
        ? `${userEmail} kullanıcısını ve ${userInstances.length} adet instance'ını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
        : `${userEmail} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`

    if (confirm(confirmMessage)) {
      try {
        // First delete user's instances
        if (userInstances.length > 0) {
          const { error: instanceError } = await supabase.from("instances").delete().eq("user_id", userId)

          if (instanceError) {
            debugLog("Error deleting user instances:", instanceError)
            alert("Kullanıcının instance'ları silinirken hata oluştu")
            return
          }
        }

        // Then delete the user profile
        const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)

        if (profileError) {
          debugLog("Error deleting user profile:", profileError)
          alert("Kullanıcı profili silinirken hata oluştu")
          return
        }

        // Finally delete from auth
        const { error: authError } = await supabase.auth.admin.deleteUser(userId)

        if (authError) {
          debugLog("Error deleting user from auth:", authError)
          alert("Kullanıcı kimlik doğrulaması silinirken hata oluştu")
          return
        }

        setSelectedUsers((prev) => prev.filter((user) => user.id !== userId))
        setSelectedInstances((prev) => prev.filter((instance) => instance.user_id !== userId))
        alert("Kullanıcı başarıyla silindi!")
      } catch (error) {
        debugLog("Error deleting user:", error)
        alert("Kullanıcı silinirken beklenmeyen bir hata oluştu")
      }
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      alert("Email ve şifre alanları zorunludur")
      return
    }

    try {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
      })

      if (authError) {
        debugLog("Error creating user:", authError)
        alert("Kullanıcı oluşturulurken hata oluştu: " + authError.message)
        return
      }

      if (!authData.user) {
        alert("Kullanıcı oluşturulamadı")
        return
      }

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: newUser.email,
        full_name: newUser.fullName || null,
        role: newUser.role,
      })

      if (profileError) {
        debugLog("Error creating profile:", profileError)
        alert("Kullanıcı profili oluşturulurken hata oluştu")
        return
      }

      // Add to local state
      const newProfile: Profile = {
        id: authData.user.id,
        email: newUser.email,
        full_name: newUser.fullName || null,
        role: newUser.role,
        created_at: new Date().toISOString(),
        phone: null,
        username: null,
        address: null,
        city: null,
        district: null,
        company_name: null,
        company_address: null,
        company_tax_number: null,
        company_website: null,
        account_type: null,
      }

      setSelectedUsers((prev) => [newProfile, ...prev])
      setNewUser({ email: "", fullName: "", role: "user", password: "" })
      setIsCreateUserOpen(false)
      alert(t.userCreated)
    } catch (error) {
      debugLog("Error creating user:", error)
      alert("Kullanıcı oluşturulurken beklenmeyen bir hata oluştu")
    }
  }

  // Removed handleEditUser function that was responsible for direct editing within the dialog.
  // Replaced with a new function that opens the edit page in a new tab.
  const handleEditUser = (userId: string) => {
    window.open(`/admin/edit/${userId}`, "_blank")
  }

  const handleDeleteInstance = async (instanceId: string, instanceName: string) => {
    if (confirm(`"${instanceName}" instance'ını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      try {
        const { error } = await supabase.from("instances").delete().eq("id", instanceId)

        if (error) {
          debugLog("Error deleting instance:", error)
          alert("Instance silinirken hata oluştu: " + error.message)
          return
        }

        setSelectedInstances((prev) => prev.filter((instance) => instance.id !== instanceId))
        alert("Instance başarıyla silindi!")
      } catch (error) {
        debugLog("Error deleting instance:", error)
        alert("Instance silinirken beklenmeyen bir hata oluştu")
      }
    }
  }

  const handleForceLogoutUser = async (userId: string, userEmail: string) => {
    if (confirm(`${userEmail} ${t.confirmForceLogout}`)) {
      try {
        // Delete all user sessions
        const { error } = await supabase.from("user_sessions").delete().eq("user_id", userId)

        if (error) {
          debugLog("Error logging out user:", error)
          alert("Kullanıcı oturumları sonlandırılırken hata oluştu: " + error.message)
          return
        }

        alert(t.userLoggedOut)
      } catch (error) {
        debugLog("Error forcing logout:", error)
        alert("Oturum sonlandırma işleminde beklenmeyen bir hata oluştu")
      }
    }
  }

  const handleSuspendUser = async (userId: string, userEmail: string) => {
    if (confirm(`${userEmail} ${t.confirmSuspend}`)) {
      try {
        // Update user role to suspended
        const { error } = await supabase.from("profiles").update({ role: "suspended" }).eq("id", userId)

        if (error) {
          debugLog("Error suspending user:", error)
          alert("Kullanıcı askıya alınırken hata oluştu: " + error.message)
          return
        }

        setSelectedUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: "suspended" } : user)))
        alert(t.userSuspended)
      } catch (error) {
        debugLog("Error suspending user:", error)
        alert("Kullanıcı askıya alınırken beklenmeyen bir hata oluştu")
      }
    }
  }

  const handleForceDisconnectInstance = async (instanceId: string, instanceName: string) => {
    if (confirm(`${instanceName} ${t.confirmForceDisconnect}`)) {
      try {
        // Update instance status to disconnected
        const { error } = await supabase
          .from("instances")
          .update({
            status: "disconnected",
            updated_at: new Date().toISOString(),
          })
          .eq("id", instanceId)

        if (error) {
          debugLog("Error disconnecting instance:", error)
          alert("Instance bağlantısı kesilirken hata oluştu: " + error.message)
          return
        }

        setSelectedInstances((prev) =>
          prev.map((instance) => (instance.id === instanceId ? { ...instance, status: "disconnected" } : instance)),
        )
        alert(t.instanceDisconnected)
      } catch (error) {
        debugLog("Error disconnecting instance:", error)
        alert("Instance bağlantısı kesilirken beklenmeyen bir hata oluştu")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      open: "bg-green-500",
      connecting: "bg-yellow-500",
      closed: "bg-red-500",
      disconnected: "bg-gray-500",
    }

    return <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white`}>{status}</Badge>
  }

  const getRoleBadge = (role: string) => {
    const roleColors = {
      admin: "destructive",
      user: "secondary",
      suspended: "outline",
    }
    return <Badge variant={roleColors[role as keyof typeof roleColors] || "secondary"}>{role}</Badge>
  }

  const filteredUsers = selectedUsers.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.company_name && user.company_name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredInstances = selectedInstances.filter(
    (instance) =>
      instance.instance_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instance.user_email && instance.user_email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Removed handleEditButtonClick and handleCloseEditDialog as the edit dialog is removed.
  // const handleEditButtonClick = (user: Profile) => {
  //   console.log("[v0] Edit button clicked for:", user.email)
  //   setEditingUser(user)
  //   isOpeningDialogRef.current = true // Set ref to true before opening dialog
  //   setIsEditUserOpen(true)
  // }

  // const handleCloseEditDialog = () => {
  //   console.log("[v0] Closing edit dialog")
  //   setIsEditUserOpen(false)
  //   setEditingUser(null)
  // }

  // console.log("[v0] Component render - isEditUserOpen:", isEditUserOpen, "editingUser:", editingUser?.email || "null")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t.adminDashboard}</h1>
                <p className="text-sm text-gray-500">{t.adminDashboardDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">
                {t.welcome}, {currentUser.email}
              </span>
              <Button onClick={handleProfile} variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profil
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                {t.logout}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tech-gradient text-balance leading-tight">
            {t.adminDashboard}
          </h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto text-balance">{t.adminDashboardDesc}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="hologram-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">{t.totalUsers}</div>
              <Users className="h-5 w-5 text-neon-cyan" />
            </div>
            <div className="text-3xl font-bold neon-text">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{users.filter((u) => u.role === "admin").length} admin</p>
          </div>

          <div className="hologram-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">{t.totalInstances}</div>
              <Server className="h-5 w-5 text-neon-blue" />
            </div>
            <div className="text-3xl font-bold neon-text">{instances.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {instances.filter((i) => i.status === "open").length} aktif
            </p>
          </div>

          <div className="hologram-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">{t.newUsers}</div>
              <UserPlus className="h-5 w-5 text-tech-green" />
            </div>
            <div className="text-3xl font-bold neon-text">
              {
                users.filter((u) => {
                  const createdDate = new Date(u.created_at)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return createdDate > weekAgo
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t.lastWeek}</p>
          </div>

          <div className="hologram-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">Aktif Instance'lar</div>
              <Server className="h-5 w-5 text-tech-orange" />
            </div>
            <div className="text-3xl font-bold neon-text">{instances.filter((i) => i.status === "open").length}</div>
            <p className="text-xs text-muted-foreground mt-1">Toplam {instances.length} instance</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg hologram-card border-0"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-8">
          <TabsList className="hologram-card p-1">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-blue data-[state=active]:to-neon-cyan data-[state=active]:text-white"
            >
              {t.userManagement}
            </TabsTrigger>
            <TabsTrigger
              value="instances"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-blue data-[state=active]:to-neon-cyan data-[state=active]:text-white"
            >
              {t.instanceManagement}
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-blue data-[state=active]:to-neon-cyan data-[state=active]:text-white"
            >
              {t.activityHistory}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="hologram-card p-8 rounded-3xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold neon-text mb-2">{t.userManagement}</h2>
                  <p className="text-muted-foreground">{t.userManagementDesc}</p>
                </div>
                <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                  <DialogTrigger asChild>
                    <Button className="tech-button">
                      <UserPlus className="h-5 w-5 mr-2" />
                      {t.createNewUser}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="hologram-card border-0">
                    <DialogHeader>
                      <DialogTitle className="text-2xl neon-text">{t.createNewUser}</DialogTitle>
                      <DialogDescription>Sisteme yeni bir kullanıcı ekleyin</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          {t.email}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                          className="col-span-3"
                          placeholder="kullanici@example.com"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                          {t.password}
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                          className="col-span-3"
                          placeholder={t.strongPassword}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fullName" className="text-right">
                          {t.fullName}
                        </Label>
                        <Input
                          id="fullName"
                          value={newUser.fullName}
                          onChange={(e) => setNewUser((prev) => ({ ...prev, fullName: e.target.value }))}
                          className="col-span-3"
                          placeholder={t.optional}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                          {t.role}
                        </Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value) => setNewUser((prev) => ({ ...prev, role: value }))}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">{t.regularUser}</SelectItem>
                            <SelectItem value="admin">{t.adminUser}</SelectItem>
                            <SelectItem value="suspended">{t.suspendedUser}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleCreateUser}>
                        {t.create}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-muted-foreground">{t.email}</TableHead>
                      <TableHead className="text-muted-foreground">{t.fullName}</TableHead>
                      <TableHead className="text-muted-foreground">Telefon</TableHead>
                      <TableHead className="text-muted-foreground">Şirket</TableHead>
                      <TableHead className="text-muted-foreground">{t.role}</TableHead>
                      <TableHead className="text-muted-foreground">{t.registrationDate}</TableHead>
                      <TableHead className="text-muted-foreground">{t.instanceCount}</TableHead>
                      <TableHead className="text-muted-foreground">{t.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const userInstanceCount = selectedInstances.filter((i) => i.user_id === user.id).length
                      return (
                        <TableRow key={user.id} className="border-border/30 hover:bg-muted/5">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-neon-cyan" />
                              <span className="text-foreground">{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">{user.full_name || "—"}</TableCell>
                          <TableCell className="text-foreground">
                            {user.phone ? (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {user.phone}
                              </div>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {user.company_name ? (
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                {user.company_name}
                              </div>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell className="text-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(user.created_at).toLocaleDateString("tr-TR")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-neon-cyan/30 text-neon-cyan">
                              {userInstanceCount}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setViewingUser(user)
                                  setIsViewUserOpen(true)
                                }}
                                className="border-neon-blue/30 hover:bg-neon-blue/10"
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                              <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value)}>
                                <SelectTrigger className="w-32 border-border/50">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="hologram-card border-0">
                                  <SelectItem value="user">{t.regularUser}</SelectItem>
                                  <SelectItem value="admin">{t.adminUser}</SelectItem>
                                  <SelectItem value="suspended">{t.suspendedUser}</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUser(user.id)}
                                className="border-neon-cyan/30 hover:bg-neon-cyan/10"
                                title="Yeni sekmede düzenle"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {user.id !== currentUser.id && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleForceLogoutUser(user.id, user.email)}
                                    title="Tüm oturumları sonlandır"
                                    className="border-yellow-500/30 hover:bg-yellow-500/10"
                                  >
                                    <Shield className="h-4 w-4" />
                                  </Button>
                                  {user.role !== "suspended" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleSuspendUser(user.id, user.email)}
                                      title="Kullanıcıyı askıya al"
                                      className="border-orange-500/30 hover:bg-orange-500/10"
                                    >
                                      <AlertTriangle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                    className="border-red-500/30 hover:bg-red-500/10 text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="instances" className="space-y-6">
            <div className="hologram-card p-8 rounded-3xl">
              <div className="mb-8">
                <h2 className="text-3xl font-bold neon-text mb-2">{t.instanceManagement}</h2>
                <p className="text-muted-foreground">{t.instanceManagementDesc}</p>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-muted-foreground">{t.instanceName}</TableHead>
                      <TableHead className="text-muted-foreground">{t.instanceOwner}</TableHead>
                      <TableHead className="text-muted-foreground">{t.status}</TableHead>
                      <TableHead className="text-muted-foreground">{t.workflowName}</TableHead>
                      <TableHead className="text-muted-foreground">{t.createdAt}</TableHead>
                      <TableHead className="text-muted-foreground">{t.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstances.map((instance) => (
                      <TableRow key={instance.id} className="border-border/30 hover:bg-muted/5">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-neon-blue" />
                            <span className="text-foreground">{instance.instance_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{instance.user_email || "Bilinmiyor"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(instance.status)}</TableCell>
                        <TableCell>
                          {instance.workflow_name ? (
                            <Badge variant="outline" className="border-neon-cyan/30 text-neon-cyan">
                              {instance.workflow_name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Oluşturulmamış</span>
                          )}
                        </TableCell>
                        <TableCell className="text-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(instance.created_at).toLocaleDateString("tr-TR")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {instance.status === "open" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleForceDisconnectInstance(instance.id, instance.instance_name)}
                                title="Bağlantıyı zorla kes"
                                className="border-orange-500/30 hover:bg-orange-500/10"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteInstance(instance.id, instance.instance_name)}
                              className="border-red-500/30 hover:bg-red-500/10 text-red-500"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {t.delete}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <AdminActivityMonitor />
          </TabsContent>
        </Tabs>

        <Dialog open={isViewUserOpen} onOpenChange={setIsViewUserOpen}>
          <DialogContent className="hologram-card border-0 max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl neon-text">Kullanıcı Detayları</DialogTitle>
              <DialogDescription>Kullanıcının tüm profil bilgilerini görüntüleyin</DialogDescription>
            </DialogHeader>
            {viewingUser && (
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <div className="text-foreground font-medium">{viewingUser.email}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Ad Soyad</Label>
                    <div className="text-foreground font-medium">{viewingUser.full_name || "—"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefon
                    </Label>
                    <div className="text-foreground font-medium">{viewingUser.phone || "—"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Kullanıcı Adı</Label>
                    <div className="text-foreground font-medium">{viewingUser.username || "—"}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adres
                  </Label>
                  <div className="text-foreground font-medium">{viewingUser.address || "—"}</div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">İl</Label>
                    <div className="text-foreground font-medium">{viewingUser.city || "—"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">İlçe</Label>
                    <div className="text-foreground font-medium">{viewingUser.district || "—"}</div>
                  </div>
                </div>

                <div className="border-t border-border/30 pt-6 mt-4">
                  <h3 className="text-lg font-bold neon-text mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Şirket Bilgileri
                  </h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Şirket Adı</Label>
                      <div className="text-foreground font-medium">{viewingUser.company_name || "—"}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Şirket Adresi</Label>
                      <div className="text-foreground font-medium">{viewingUser.company_address || "—"}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Vergi Numarası</Label>
                        <div className="text-foreground font-medium">{viewingUser.company_tax_number || "—"}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Website</Label>
                        <div className="text-foreground font-medium">{viewingUser.company_website || "—"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/30 pt-6 mt-4">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Hesap Tipi</Label>
                      <div className="text-foreground font-medium">{viewingUser.account_type || "—"}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Rol</Label>
                      <div>{getRoleBadge(viewingUser.role)}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Kayıt Tarihi
                      </Label>
                      <div className="text-foreground font-medium">
                        {new Date(viewingUser.created_at).toLocaleDateString("tr-TR")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
