"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Lock, Eye, EyeOff, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"

interface VideoPlayerProps {
  slug: string
  title: string
  description: string | null
  hasPassword: boolean
  passwordExpired: boolean
  allowExpiredPassword: boolean
}

interface VideoData {
  title: string
  description: string | null
  blob_url: string
  mime_type: string
}

export function VideoPlayer({
  slug,
  title,
  description,
  hasPassword,
  passwordExpired,
  allowExpiredPassword,
}: VideoPlayerProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(!hasPassword)

  // If no password required, fetch video immediately
  useState(() => {
    if (!hasPassword) {
      verifyAccess("")
    }
  })

  async function verifyAccess(pwd: string) {
    setIsVerifying(true)
    setError(null)

    try {
      const response = await fetch(`/api/video/${slug}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setError(data.error || "Too many attempts. Please try again later.")
        } else if (response.status === 403 && data.expired) {
          setError(data.error)
        } else {
          setError(data.error || "Verification failed")
        }
        return
      }

      setVideoData(data.video)
      setIsUnlocked(true)
    } catch {
      setError("Failed to verify access")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError("Please enter a password")
      return
    }
    verifyAccess(password)
  }

  // Show password prompt
  if (!isUnlocked) {
    const showExpiredWarning = passwordExpired && !allowExpiredPassword

    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-balance">{title}</CardTitle>
            {description && <CardDescription className="text-pretty">{description}</CardDescription>}
          </CardHeader>
          <CardContent>
            {showExpiredWarning ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <Clock className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-sm text-muted-foreground">
                  The password for this video has expired. Please contact the video owner for a new password.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">This video is password protected</p>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      disabled={isVerifying}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isVerifying}>
                  {isVerifying ? "Verifying..." : "Unlock Video"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                <Video className="mr-1 inline h-4 w-4" />
                SecureVideo
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show video player
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">SecureVideo</span>
          </Link>
        </div>
      </header>

      {/* Video Content */}
      <main className="flex-1 bg-black">
        <div className="mx-auto max-w-6xl">
          {videoData ? (
            <video
              src={videoData.blob_url}
              controls
              autoPlay
              className="aspect-video w-full bg-black"
              controlsList="nodownload"
            >
              <track kind="captions" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex aspect-video items-center justify-center">
              <p className="text-white">Loading video...</p>
            </div>
          )}
        </div>
      </main>

      {/* Video Info */}
      <div className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">{videoData?.title || title}</h1>
          {(videoData?.description || description) && (
            <p className="mt-2 text-muted-foreground">{videoData?.description || description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
