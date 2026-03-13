import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { VideoUploadForm } from "@/components/video-upload-form"
import { DashboardHeader } from "@/components/dashboard-header"

export default async function UploadPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-svh bg-background">
      <DashboardHeader user={user} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <VideoUploadForm />
      </main>
    </div>
  )
}
