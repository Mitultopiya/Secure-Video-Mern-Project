"use client"

import { useState } from "react"
import type { Video } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Trash2, ExternalLink, Lock, Eye } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface AdminVideoListProps {
  initialVideos: Video[]
}

export function AdminVideoList({ initialVideos }: AdminVideoListProps) {
  const [videos, setVideos] = useState(initialVideos)
  const [search, setSearch] = useState("")
  const [deleteVideo, setDeleteVideo] = useState<Video | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredVideos = videos.filter(
    (v) => v.title.toLowerCase().includes(search.toLowerCase()) || v.slug.toLowerCase().includes(search.toLowerCase()),
  )

  const handleDelete = async () => {
    if (!deleteVideo) return
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/videos/${deleteVideo.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete video")
      }

      setVideos(videos.filter((v) => v.id !== deleteVideo.id))
      toast.success("Video deleted")
    } catch {
      toast.error("Failed to delete video")
    } finally {
      setIsDeleting(false)
      setDeleteVideo(null)
    }
  }

  return (
    <>
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead className="text-center">Protected</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVideos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No videos found
                </TableCell>
              </TableRow>
            ) : (
              filteredVideos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">{video.title}</TableCell>
                  <TableCell className="font-mono text-sm">{video.slug}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {video.view_count}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {video.password_hash ? (
                      <Lock className="mx-auto h-4 w-4 text-primary" />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{(video.file_size / 1024 / 1024).toFixed(1)} MB</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={`/v/${video.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteVideo(video)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteVideo} onOpenChange={() => setDeleteVideo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteVideo?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteVideo(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
