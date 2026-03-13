"use client"

import { useState } from "react"
import type { Video } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, MoreVertical, Copy, Trash2, Lock, LockOpen, Settings, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { PasswordSettingsDialog } from "@/components/password-settings-dialog"
import { formatDistanceToNow } from "date-fns"

interface VideoCardProps {
  video: Video
  onDelete: (id: string) => void
  onUpdate: (video: Video) => void
}

export function VideoCard({ video, onDelete, onUpdate }: VideoCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  const videoUrl = `${window.location.origin}/v/${video.slug}`

  const copyLink = () => {
    navigator.clipboard.writeText(videoUrl)
    toast.success("Link copied to clipboard!")
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/videos/${video.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete video")
      }

      toast.success("Video deleted")
      onDelete(video.id)
    } catch {
      toast.error("Failed to delete video")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const hasPassword = !!video.password_hash
  const passwordExpired = video.password_expires_at ? new Date(video.password_expires_at) < new Date() : false

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-muted">
          <video src={video.blob_url} className="h-full w-full object-cover" muted preload="metadata" />
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
            <Eye className="h-3 w-3" />
            {video.view_count}
          </div>
          {hasPassword && (
            <div
              className={`absolute left-2 top-2 rounded px-2 py-1 text-xs ${passwordExpired && !video.allow_expired_password ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}
            >
              <Lock className="mr-1 inline h-3 w-3" />
              {passwordExpired && !video.allow_expired_password ? "Expired" : "Protected"}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="line-clamp-1 font-medium text-card-foreground">{video.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t border-border p-2">
          <Button variant="ghost" size="sm" onClick={copyLink} className="gap-1">
            <Copy className="h-4 w-4" />
            Copy Link
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Link
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowPasswordDialog(true)}>
                {hasPassword ? (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    Password Settings
                  </>
                ) : (
                  <>
                    <LockOpen className="mr-2 h-4 w-4" />
                    Add Password
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{video.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Settings Dialog */}
      <PasswordSettingsDialog
        video={video}
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onUpdate={onUpdate}
      />
    </>
  )
}
