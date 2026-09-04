# Hair Craft Mens Saloon

End-to-end booking app for **Hair Craft Mens Saloon** — customer booking, admin desk, reminders, and AI hairstyle recommendations.

## Features

- **Book online** — Haircut (30 min), Beard (20 min), or Both (45 min)
- **Barbers** — Babu & Shivappa with live slot availability
- **Hours** — Sun–Fri 9:00–21:00 · Saturday 9:00–12:00
- **Admin panel** — `/admin` to filter and manage bookings
- **Reminders** — browser notifications ~1 hour before the appointment
- **Style AI** — selfie / camera → face-shape based cut recommendations
- **My bookings** — lookup & cancel by phone number

## Quick start

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Admin

- URL: `/admin`
- Default: `admin` / `admin123` (change in `.env`)

## Tech

Next.js · Prisma · SQLite · Tailwind CSS · TypeScript
