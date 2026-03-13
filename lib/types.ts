export interface Video {
  id: string
  user_id: string
  slug: string
  title: string
  description: string | null
  blob_url: string
  file_size: number
  mime_type: string
  duration: number | null
  thumbnail_url: string | null
  view_count: number
  password_hash: string | null
  password_expires_at: string | null
  allow_expired_password: boolean
  created_at: string
  updated_at: string
}

export interface PasswordAttempt {
  id: string
  video_id: string
  ip_address: string
  attempted_at: string
  success: boolean
}

export interface VideoAccessLog {
  id: string
  video_id: string
  ip_address: string | null
  user_agent: string | null
  accessed_at: string
}

export type PasswordExpiration = "1h" | "6h" | "12h" | "24h" | "7d" | "30d" | "never" | "custom"

export function generateSlug(length = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let slug = ""
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return slug
}

export function getExpirationDate(expiration: PasswordExpiration, customDate?: Date): Date | null {
  if (expiration === "never") return null
  if (expiration === "custom" && customDate) return customDate

  const now = new Date()
  switch (expiration) {
    case "1h":
      return new Date(now.getTime() + 1 * 60 * 60 * 1000)
    case "6h":
      return new Date(now.getTime() + 6 * 60 * 60 * 1000)
    case "12h":
      return new Date(now.getTime() + 12 * 60 * 60 * 1000)
    case "24h":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case "7d":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case "30d":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    default:
      return null
  }
}
