"use client"

import { useState } from "react"
import type { Video } from "@/lib/types"
import { VideoCard } from "@/components/video-card"

interface VideoListProps {
  videos: Video[]
}

export function VideoList({ videos: initialVideos }: VideoListProps) {
  const [videos, setVideos] = useState(initialVideos)

  const handleDelete = (deletedId: string) => {
    setVideos(videos.filter((v) => v.id !== deletedId))
  }

  const handleUpdate = (updatedVideo: Video) => {
    setVideos(videos.map((v) => (v.id === updatedVideo.id ? updatedVideo : v)))
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onDelete={handleDelete} onUpdate={handleUpdate} />
      ))}
    </div>
  )
}
