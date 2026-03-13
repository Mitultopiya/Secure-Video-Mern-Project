import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { VideoList } from "@/components/video-list"
import { Button } from "@/components/ui/button"
import { Upload, Video } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's videos
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const totalViews = videos?.reduce((sum, v) => sum + v.view_count, 0) || 0
  const totalStorage = videos?.reduce((sum, v) => sum + v.file_size, 0) || 0

  return (
    <div className="min-h-svh bg-background">
      <DashboardHeader user={user} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Videos</p>
            <p className="text-2xl font-bold text-card-foreground">{videos?.length || 0}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Views</p>
            <p className="text-2xl font-bold text-card-foreground">{totalViews}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Storage Used</p>
            <p className="text-2xl font-bold text-card-foreground">{(totalStorage / 1024 / 1024).toFixed(1)} MB</p>
          </div>
        </div>

        {/* Videos Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Your Videos</h2>
          <Link href="/dashboard/upload">
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Video
            </Button>
          </Link>
        </div>

        {videos && videos.length > 0 ? (
          <VideoList videos={videos} />
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <Video className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No videos yet</h3>
            <p className="mt-1 text-muted-foreground">Upload your first video to get started</p>
            <Link href="/dashboard/upload" className="mt-4">
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Video
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
