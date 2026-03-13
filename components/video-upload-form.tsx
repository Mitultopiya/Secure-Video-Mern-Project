"use client"

import type React from "react"
import { useState, useRef } from "react"
import { upload } from "@vercel/blob/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Upload, Video, Lock, Eye, EyeOff, CheckCircle, Copy } from "lucide-react"
import { toast } from "sonner"
import type { PasswordExpiration } from "@/lib/types"

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

interface UploadResult {
  id: string
  slug: string
  title: string
  url: string
}

export function VideoUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordExpiration, setPasswordExpiration] = useState<PasswordExpiration>("24h")
  const [allowExpiredPassword, setAllowExpiredPassword] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState("")
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith("video/")) {
        toast.error("Please select a video file")
        return
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error("File size exceeds 100MB limit")
        return
      }
      setFile(selectedFile)
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      if (!droppedFile.type.startsWith("video/")) {
        toast.error("Please drop a video file")
        return
      }
      if (droppedFile.size > MAX_FILE_SIZE) {
        toast.error("File size exceeds 100MB limit")
        return
      }
      setFile(droppedFile)
      if (!title) {
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.error("Please select a video file")
      return
    }

    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadStatus("Uploading video...")

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
        onUploadProgress: (progress) => {
          // Progress is 0-100 for the blob upload portion (0-80% of total)
          setUploadProgress(Math.round(progress.percentage * 0.8))
        },
      })

      setUploadProgress(85)
      setUploadStatus("Saving video details...")

      const response = await fetch("/api/videos/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          blobUrl: blob.url,
          password: password || null,
          passwordExpiration: password ? passwordExpiration : null,
          allowExpiredPassword: password ? allowExpiredPassword : false,
          fileSize: file.size,
          mimeType: file.type,
        }),
      })

      setUploadProgress(95)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save video")
      }

      setUploadProgress(100)
      setUploadResult(data.video)
      toast.success("Video uploaded successfully!")
    } catch (error) {
      console.error("[v0] Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
      setUploadStatus("")
    }
  }

  const copyLink = () => {
    if (uploadResult) {
      navigator.clipboard.writeText(uploadResult.url)
      toast.success("Link copied to clipboard!")
    }
  }

  const resetForm = () => {
    setFile(null)
    setTitle("")
    setDescription("")
    setPassword("")
    setPasswordExpiration("24h")
    setAllowExpiredPassword(false)
    setUploadProgress(0)
    setUploadResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (uploadResult) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Upload Complete!</CardTitle>
          <CardDescription>Your video is ready to share</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Video Title</Label>
            <p className="font-medium">{uploadResult.title}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Share Link</Label>
            <div className="mt-1 flex gap-2">
              <Input value={uploadResult.url} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={resetForm} className="flex-1">
              Upload Another
            </Button>
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <a href={`/dashboard`}>Go to Dashboard</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Video
        </CardTitle>
        <CardDescription>Upload a video up to 100MB and optionally protect it with a password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Drop Zone */}
          <div
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              file ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            {file ? (
              <div className="text-center">
                <Video className="mx-auto h-12 w-12 text-primary" />
                <p className="mt-2 font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 font-medium">Drop your video here or click to browse</p>
                <p className="text-sm text-muted-foreground">Maximum file size: 100MB</p>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          {/* Password Protection Section */}
          <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Password Protection</span>
              <span className="text-sm text-muted-foreground">(Optional)</span>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave empty for no password"
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

            {/* Password Expiration */}
            {password && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="expiration">Password Expires In</Label>
                  <Select
                    value={passwordExpiration}
                    onValueChange={(value) => setPasswordExpiration(value as PasswordExpiration)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="6h">6 hours</SelectItem>
                      <SelectItem value="12h">12 hours</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Allow Expired Password */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-expired">Allow expired password</Label>
                    <p className="text-sm text-muted-foreground">
                      If enabled, the password will still work after expiration
                    </p>
                  </div>
                  <Switch id="allow-expired" checked={allowExpiredPassword} onCheckedChange={setAllowExpiredPassword} />
                </div>
              </>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{uploadStatus}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={!file || isUploading}>
            {isUploading ? "Uploading..." : "Upload Video"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
