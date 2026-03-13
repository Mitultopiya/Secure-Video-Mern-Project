import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { is_admin } = await request.json()

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

    // Note: To actually update user metadata, you would need to use the Supabase Admin API
    // with the service role key. For now, this is a placeholder that would need to be
    // implemented with proper admin privileges.

    return NextResponse.json({
      success: true,
      message: "Admin status would be updated with proper Supabase Admin API integration",
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}
