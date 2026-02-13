# School Management Portal

A comprehensive school management system built with Next.js 14 App Router, featuring role-based access for students, teachers, and administrators.

## 🚀 Features

### Student Portal
- **Timetable Viewing** (Server-Side Rendering)
- **Grades Management** (Static Site Generation with ISR)
- **Report Card Download** (PDF Generation)
- **Attendance History** (Server Components)

### Teacher Portal
- **Upload Grades** (Server Actions)
- **Mark Attendance** (Optimistic UI)
- **Class Analytics** (Interactive Charts)

### Admin Portal
- **User Management** (Students & Teachers CRUD)
- **Role-Based Access Control** (Middleware)
- **Bulk Upload** (CSV Import)

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** MySQL
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **PDF Generation:** jsPDF
- **CSV Parsing:** PapaParse
- **Language:** TypeScript

## 📋 Prerequisites

- Node.js 18+ installed
- MySQL 8+ installed and running
- npm or yarn package manager

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=school_management
DB_PORT=3306

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here-change-this
NEXTAUTH_URL=http://localhost:3000

# Application
NODE_ENV=development
```

**Important:** Replace `your_mysql_password` with your actual MySQL password and generate a secure secret for `NEXTAUTH_SECRET`.

### 3. Setup Database

Run the SQL schema file to create the database and tables:

```bash
mysql -u root -p < database/schema.sql
```

Or manually:
1. Open MySQL command line or MySQL Workbench
2. Run the contents of `database/schema.sql`

This will:
- Create the `school_management` database
- Create all necessary tables
- Insert sample data with demo users

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Credentials

### Admin
- Email: `admin@school.com`
- Password: `admin123`

### Teacher
- Email: `teacher1@school.com`
- Password: `teacher123`

### Student
- Email: `student1@school.com`
- Password: `student123`

## 📁 Project Structure

```
school-management-portal/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   ├── api/               # API Routes
│   ├── admin/             # Admin pages
│   ├── student/           # Student pages
│   ├── teacher/           # Teacher pages
│   └── login/             # Authentication
├── components/            # React Components
├── lib/                   # Utilities
│   ├── db.ts             # Database connection
│   └── auth.ts           # NextAuth configuration
├── database/             # SQL schemas
├── types/                # TypeScript types
└── middleware.ts         # Route protection

```

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Protected API routes
- SQL injection prevention

## 📊 Database Schema

- **users** - User accounts (all roles)
- **students** - Student-specific data
- **teachers** - Teacher-specific data
- **subjects** - Course subjects
- **classes** - Class sections
- **timetable** - Schedule management
- **grades** - Student grades
- **attendance** - Attendance records

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Make sure to update:
- `NEXTAUTH_URL` to your production domain
- `NEXTAUTH_SECRET` with a strong secret
- Database credentials for production

## 📝 CSV Format for Bulk Upload

### Students
```csv
name,email,password,role,student_id,class,section,roll_number,phone
John Doe,john@example.com,password123,student,STU003,10,A,3,1234567890
```

### Teachers
```csv
name,email,password,role,teacher_id,subject,qualification,phone
Jane Smith,jane@example.com,password123,teacher,TCH003,English,M.A. English,9876543210
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running: `sudo service mysql status`
- Check credentials in `.env` file
- Ensure database exists: `SHOW DATABASES;`

### Port Already in Use
- Change port: `npm run dev -- -p 3001`

### Build Errors
- Clear cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 📄 License

This project is open source and available under the MIT License.

## 👥 Support

For issues or questions, please open an issue in the repository.
