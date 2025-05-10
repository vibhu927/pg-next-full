# PG Management System

A comprehensive system for managing paying guest accommodations, built with Next.js, Prisma, and PostgreSQL.

## Features

- User authentication (login/register)
- Dashboard with analytics and graphs
- Tenant management
- Room management
- Property management
- Dark/light mode theme toggle
- Responsive design

## Tech Stack

- **Frontend**: Next.js 14 with App Router, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **UI Components**: Custom components with Tailwind
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for PostgreSQL)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd pg-management-system
```

2. Install dependencies:

```bash
npm install
```

3. Start the PostgreSQL database using Docker:

```bash
docker-compose up -d
```

4. Set up the environment variables:

```bash
# The .env file should already be created with default values
# You can modify it if needed
```

5. Run Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev --name init
```

6. Start the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Migrations

To create and apply database migrations:

```bash
# Generate a migration from your Prisma schema
npx prisma migrate dev --name <migration-name>

# Apply migrations to the database
npx prisma migrate deploy
```

## Project Structure

```
pg-management-system/
├── prisma/                # Prisma schema and migrations
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── dashboard/     # Dashboard page
│   │   ├── login/         # Login page
│   │   ├── register/      # Register page
│   │   ├── tenants/       # Tenants page
│   │   ├── rooms/         # Rooms page
│   │   ├── properties/    # Properties page
│   │   └── settings/      # Settings page
│   ├── components/        # React components
│   │   ├── auth/          # Authentication components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # UI components
│   ├── lib/               # Library code
│   └── utils/             # Utility functions
├── .env                   # Environment variables
├── docker-compose.yml     # Docker Compose configuration
└── README.md              # Project documentation
```

## License

This project is licensed under the MIT License.
