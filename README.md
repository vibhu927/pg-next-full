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
- PostgreSQL (local installation or Docker)

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

3. Set up PostgreSQL:

#### Option 1: Using Docker (Recommended)

```bash
docker-compose up -d
```

#### Option 2: Using Local PostgreSQL Installation

1. Install PostgreSQL if you haven't already:
   - Windows: Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Mac: `brew install postgresql && brew services start postgresql`
   - Linux: `sudo apt-get install postgresql postgresql-contrib && sudo service postgresql start`

2. Create a local database:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE pg_management;
   CREATE USER pguser WITH ENCRYPTED PASSWORD 'pgpassword';
   GRANT ALL PRIVILEGES ON DATABASE pg_management TO pguser;
   \q
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials in `.env` to match your local setup:
     ```
     DATABASE_URL="postgresql://pguser:pgpassword@localhost:5432/pg_management?schema=public"
     ```

4. Run Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev --name init
```

5. (Optional) Seed the database with sample data:

```bash
npx prisma db seed
```

6. Start the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database

### Database Schema

The application uses the following database schema:

- **User**: Stores user information and authentication details
- **Property**: Stores property information (name, address, etc.)
- **Room**: Stores room information (room number, type, price, etc.)
- **Tenant**: Stores tenant information (name, contact details, lease information, etc.)
- **Payment**: Stores payment records for tenants

### Database Migrations

To create and apply database migrations:

```bash
# Generate a migration from your Prisma schema
npx prisma migrate dev --name <migration-name>

# Apply migrations to the database
npx prisma migrate deploy
```

### Database Management

You can use Prisma Studio to view and manage your database:

```bash
npx prisma studio
```

This will open a web interface at [http://localhost:5555](http://localhost:5555) where you can browse and edit your data.

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
