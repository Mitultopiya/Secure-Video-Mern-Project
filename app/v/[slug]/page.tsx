import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { VideoPlayer } from "@/components/video-player"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: video } = await supabase.from("videos").select("title, description").eq("slug", slug).single()

  if (!video) {
    return {
      title: "Video Not Found - SecureVideo",
    }
  }

  return {
    title: `${video.title} - SecureVideo`,
    description: video.description || "Watch this video on SecureVideo",
  }
}

export default async function VideoPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: video, error } = await supabase
    .from("videos")
    .select("id, slug, title, description, password_hash, password_expires_at, allow_expired_password")
    .eq("slug", slug)
    .single()

  if (error || !video) {
    notFound()
  }

  const hasPassword = !!video.password_hash
  const passwordExpired = video.password_expires_at ? new Date(video.password_expires_at) < new Date() : false

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <VideoPlayer
        slug={slug}
        title={video.title}
        description={video.description}
        hasPassword={hasPassword}
        passwordExpired={passwordExpired}
        allowExpiredPassword={video.allow_expired_password}
      />
    </div>
  )
}
