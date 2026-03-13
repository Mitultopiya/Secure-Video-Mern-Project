import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, FileQuestion } from "lucide-react"
import Link from "next/link"

export default function VideoNotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Video Not Found</CardTitle>
          <CardDescription>This video may have been deleted or the link is incorrect.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/">
            <Button className="gap-2">
              <Video className="h-4 w-4" />
              Go to SecureVideo
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
