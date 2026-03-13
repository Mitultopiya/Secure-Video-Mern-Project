import { Button } from "@/components/ui/button"
import { Video, Shield, LinkIcon, Clock, Heart } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Secure Video</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Share Videos Securely with Password Protection
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Upload videos up to 100MB, create permanent links, and control access with time-limited passwords. Your
            content stays secure.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/auth/login">
              <Button size="lg" className="gap-2">
                <Video className="h-5 w-5" />
                Start Uploading
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-foreground">
            Everything you need for secure video sharing
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-card-foreground">Password Protected</h3>
              <p className="mt-2 text-muted-foreground">
                Set passwords on your video links with optional expiration times for added security.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <LinkIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-card-foreground">Permanent Links</h3>
              <p className="mt-2 text-muted-foreground">
                Your video URLs never change. Share once, update passwords anytime.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-card-foreground">Time-Limited Access</h3>
              <p className="mt-2 text-muted-foreground">
                Set password expiration from hours to days. Control when access expires.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          {new Date().getFullYear()} Secure Video. By <a href="https://www.linkedin.com/in/abhishek-rajput-/"><strong>Abhishek</strong></a> <Heart className="inline h-4 w-4 text-red-500" />.
        </div>
      </footer>
    </div>
  )
}
