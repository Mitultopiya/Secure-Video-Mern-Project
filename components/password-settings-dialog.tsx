"use client"

import type React from "react"

import { useState } from "react"
import type { Video, PasswordExpiration } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, EyeOff, Lock, LockOpen } from "lucide-react"
import { toast } from "sonner"

interface PasswordSettingsDialogProps {
  video: Video
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (video: Video) => void
}

export function PasswordSettingsDialog({ video, open, onOpenChange, onUpdate }: PasswordSettingsDialogProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordExpiration, setPasswordExpiration] = useState<PasswordExpiration>("24h")
  const [allowExpiredPassword, setAllowExpiredPassword] = useState(video.allow_expired_password)
  const [isSaving, setIsSaving] = useState(false)

  const hasPassword = !!video.password_hash

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/videos/${video.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: password || null,
          passwordExpiration,
          allowExpiredPassword,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update password settings")
      }

      const { video: updatedVideo } = await response.json()
      onUpdate(updatedVideo)
      toast.success(password ? "Password updated" : "Password removed")
      onOpenChange(false)
      setPassword("")
    } catch {
      toast.error("Failed to update password settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemovePassword = async () => {
    setIsSaving(true)

    try {
      const response = await fetch(`/api/videos/${video.id}/password`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove password")
      }

      const { video: updatedVideo } = await response.json()
      onUpdate(updatedVideo)
      toast.success("Password removed")
      onOpenChange(false)
    } catch {
      toast.error("Failed to remove password")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasPassword ? <Lock className="h-5 w-5" /> : <LockOpen className="h-5 w-5" />}
            Password Settings
          </DialogTitle>
          <DialogDescription>
            {hasPassword ? "Update or remove the password for this video" : "Add a password to protect this video"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{hasPassword ? "New Password" : "Password"}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={hasPassword ? "Enter new password" : "Enter password"}
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

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-expired">Allow expired password</Label>
              <p className="text-sm text-muted-foreground">Password still works after expiration</p>
            </div>
            <Switch id="allow-expired" checked={allowExpiredPassword} onCheckedChange={setAllowExpiredPassword} />
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {hasPassword && (
              <Button type="button" variant="outline" onClick={handleRemovePassword} disabled={isSaving}>
                Remove Password
              </Button>
            )}
            <Button type="submit" disabled={isSaving || (!password && !hasPassword)}>
              {isSaving ? "Saving..." : hasPassword ? "Update Password" : "Set Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
