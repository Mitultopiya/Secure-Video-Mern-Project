import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { del } from "@vercel/blob"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin status
    const isAdmin = user.user_metadata?.is_admin === true
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get video to get blob URL
    const { data: video, error: getError } = await supabase.from("videos").select("*").eq("id", id).single()

    if (getError || !video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Delete from Vercel Blob
    try {
      await del(video.blob_url)
    } catch (blobError) {
      console.error("Blob delete error:", blobError)
    }

    // Delete from database (use service role to bypass RLS)
    const { error: deleteError } = await supabase.from("videos").delete().eq("id", id)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete video" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
