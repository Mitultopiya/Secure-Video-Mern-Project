import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { AdminVideoList } from "@/components/admin-video-list"
import { AdminUserList } from "@/components/admin-user-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Video, Users } from "lucide-react"

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const isAdmin = user.user_metadata?.is_admin === true

  if (!isAdmin) {
    redirect("/dashboard")
  }

  // Fetch all videos with user info
  const { data: videos } = await supabase
    .from("videos")
    .select("*, user_email:user_id")
    .order("created_at", { ascending: false })

  // Get total stats
  const totalVideos = videos?.length || 0
  const totalViews = videos?.reduce((sum, v) => sum + v.view_count, 0) || 0
  const totalStorage = videos?.reduce((sum, v) => sum + v.file_size, 0) || 0

  return (
    <div className="min-h-svh bg-background">
      <DashboardHeader user={user} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Admin Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage users and content</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Videos</p>
            <p className="text-2xl font-bold text-card-foreground">{totalVideos}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Views</p>
            <p className="text-2xl font-bold text-card-foreground">{totalViews}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Storage</p>
            <p className="text-2xl font-bold text-card-foreground">{(totalStorage / 1024 / 1024).toFixed(1)} MB</p>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="videos">
          <TabsList>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-6">
            <AdminVideoList initialVideos={videos || []} />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <AdminUserList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
