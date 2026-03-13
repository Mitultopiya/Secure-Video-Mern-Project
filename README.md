# SecureVideo - Secure Video Sharing Platform

SecureVideo is a modern, secure video sharing platform built with Next.js and Supabase. Share videos up to 100MB with password protection, time-limited access, and permanent links. Perfect for sharing sensitive content with controlled access.

## 🚀 Features

- **Password Protected Videos**: Set strong passwords on your video links
- **Time-Limited Access**: Control when passwords expire (hours to days)
- **Permanent Links**: Share once, update passwords anytime
- **Large File Support**: Upload videos up to 100MB
- **Analytics**: Track views and access attempts
- **Rate Limiting**: Prevent brute force attacks on passwords
- **Responsive Design**: Works on all devices
- **Secure Storage**: Uses Vercel Blob for reliable storage

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Storage**: Vercel Blob
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   https://github.com/Mitultopiya/Secure-Video-Mern-Project.git
   cd secure-video-upload
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase and Vercel Blob credentials.

4. **Set up the database**
   ```bash
   pnpm run setup-db
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

## 🚀 Usage

### Uploading Videos

1. Sign up for an account
2. Go to the dashboard
3. Click "Upload Video"
4. Select your video file (max 100MB)
5. Add title and description
6. Set a password (optional)
7. Choose expiration time
8. Upload and get your shareable link

### Sharing Videos

- Share the generated link with your audience
- Recipients enter the password to access the video
- Track views and access attempts in your dashboard

## 🔧 API Reference

### Upload Video
```http
POST /api/upload
Content-Type: multipart/form-data

Form Data:
- file: Video file
- title: Video title
- description: Video description (optional)
- password: Password (optional)
- passwordExpiration: Expiration time
- allowExpiredPassword: Boolean
```

### Get Video Info
```http
GET /api/video/[slug]
```

### Verify Password
```http
POST /api/video/[slug]/verify
Content-Type: application/json

{
  "password": "yourpassword"
}
```

## 🗄️ Database Schema

### Videos Table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to auth.users)
- `slug`: TEXT (Unique identifier)
- `title`: TEXT
- `description`: TEXT
- `blob_url`: TEXT
- `file_size`: BIGINT
- `mime_type`: TEXT
- `duration`: INTEGER
- `thumbnail_url`: TEXT
- `view_count`: INTEGER
- `password_hash`: TEXT (bcrypt)
- `password_expires_at`: TIMESTAMPTZ
- `allow_expired_password`: BOOLEAN
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### Password Attempts Table
- `id`: UUID
- `video_id`: UUID
- `ip_address`: INET
- `attempted_at`: TIMESTAMPTZ
- `success`: BOOLEAN

### Video Access Logs Table
- `id`: UUID
- `video_id`: UUID
- `ip_address`: INET
- `user_agent`: TEXT
- `accessed_at`: TIMESTAMPTZ

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: `5` attempts per `15` minutes per IP address
- **IP Tracking**: Monitor access attempts
- **Expiration Control**: Time-based password expiration
- **Secure URLs**: Random slugs prevent guessing

## 📊 Analytics

- View count tracking
- Password attempt logging
- Access logs with IP and user agent
- Dashboard for video management

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request


**Keywords**: secure video sharing, password protected videos, Next.js video upload, Supabase video platform, Vercel Blob storage, time-limited video access, secure file sharing, video password protection webiste</content>
