# 📚 LibraLink - Library Management System

A comprehensive full-stack library management system built with modern web technologies. Manage books, users, borrowing, ratings, and more with a beautiful, responsive interface.

![LibraLink Logo](src/images/LibraLinkLogo.png)

## ✨ Features

### 👤 User Management

- **Role-based authentication**: Admin, Librarian, Clerk, and regular Users
- **Secure authentication**: JWT tokens with bcrypt password hashing
- **OTP verification**: Email-based account verification
- **Profile management**: User accounts with role-specific permissions

### 📖 Book Management

- **Dual format support**: Physical books and e-books
- **Comprehensive catalog**: Title, author, description, genre, publication year
- **File uploads**: Cover images and PDF uploads for e-books
- **Donation system**: Users can donate books with approval workflow
- **Inventory tracking**: Quantity management for physical books

### 🔄 Borrowing System

- **Borrow requests**: Users can request to borrow books
- **Approval workflow**: Librarians/clerk approval process
- **Due dates**: Return date tracking
- **Status management**: Pending, approved, rejected, returned, lost

### ⭐ Social Features

- **Rating system**: 5-star book ratings with averages
- **Comments**: User discussions on books
- **Saved books**: Personal reading lists
- **Reading progress**: Page tracking for e-books
- **Discussion posts**: Community forum for book recommendations

### 🎨 Modern UI/UX

- **Responsive design**: Works on desktop, tablet, and mobile
- **Dark theme**: Modern dark color scheme with gradients
- **Glassmorphism**: Blur effects and transparent elements
- **Smooth animations**: Hover effects and transitions
- **Accessible**: Keyboard navigation and screen reader support

### 📊 Administrative Features

- **Dashboard analytics**: System statistics and insights
- **User management**: Admin panel for user administration
- **Book encoding**: Clerk interface for adding new books
- **Audit logs**: Comprehensive logging of all system activities
- **Genre management**: Dynamic genre categorization

## 🛠️ Technology Stack

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **multer** - File upload handling
- **nodemailer** - Email service
- **cors** - Cross-origin resource sharing

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid/Flexbox
- **Vanilla JavaScript** - DOM manipulation and API integration
- **PDF.js** - PDF document viewer

### Deployment

- **Vercel** - Serverless deployment platform

### Development Tools

- **nodemon** - Development server auto-restart
- **MongoDB Atlas** - Cloud database hosting

## 🚀 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Gmail account for email notifications

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/jarreugse09/Library-Management.git
   cd Library-Management
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/libralink
   PORT=7001
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
   NODE_ENV=development

   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=465
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Database Setup**

   - Create a MongoDB Atlas cluster or use local MongoDB
   - Update the `CONNECTION_STRING` in `.env`

5. **Seed the Database** (Optional)

   ```bash
   npm run seed
   ```

   This will populate the database with sample users, books, and data.

6. **Start the Application**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

7. **Access the Application**
   Open your browser and navigate to `http://localhost:7001`

## 📋 Usage

### User Roles & Credentials

After seeding the database, use these credentials:

| Role  | Username  | Password    |
| ----- | --------- | ----------- |
| Admin | admin     | password123 |
| Clerk | clerk1    | password123 |
| User  | johndoe   | password123 |
| User  | janesmith | password123 |

### Key Workflows

#### For Regular Users:

1. **Browse Books**: Explore the catalog by genre or search
2. **Borrow Books**: Submit borrow requests for approval
3. **Rate & Review**: Leave ratings and comments on books
4. **Save Books**: Create personal reading lists
5. **Donate Books**: Contribute new books to the library

#### For Librarians/Clerks:

1. **Approve Donations**: Review and approve user-donated books
2. **Manage Borrowings**: Approve/reject borrow requests
3. **Encode Books**: Add new books to the catalog
4. **Monitor Inventory**: Track book quantities and status

#### For Admins:

1. **User Management**: Manage user accounts and roles
2. **System Analytics**: View dashboard statistics
3. **Audit Logs**: Monitor all system activities

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/send-otp` - Send OTP for verification
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get current user info

### Book Management

- `GET /api/books/ebook/` - Get all e-books
- `GET /api/books/physical/` - Get all physical books
- `GET /api/books/genre/` - Get all genres
- `POST /api/books/ebook/my-book/save-book` - Save book to library
- `DELETE /api/books/ebook/my-book/remove-book/:id` - Remove saved book

### Borrowing System

- `GET /api/borrows/` - Get borrow requests
- `POST /api/borrows/` - Create borrow request

### Administrative

- `GET /api/dashboard/` - Dashboard statistics
- `GET /api/users/` - User management
- `POST /api/donations/` - Book donations

## 🗄️ Database Schema

### Core Models

- **User**: Authentication and profile data
- **Book**: Book catalog with metadata
- **Borrow**: Borrowing transactions
- **Rating**: User book ratings
- **Comment**: Book discussions
- **Post**: Community forum posts
- **Genre**: Book categorization
- **Log**: System audit trail

### Key Relationships

- Users can borrow books, rate them, save them, and comment
- Books belong to donors and can have multiple ratings
- Borrows link users to books with approval workflow
- Comments and posts create community engagement

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**

   - Link your GitHub repository to Vercel
   - Vercel will automatically detect the Node.js application

2. **Environment Variables**
   Set these in Vercel dashboard:

   ```
   NODE_ENV=production
   CONNECTION_STRING=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

3. **Build Settings**

   - Build Command: `npm run build` (if needed)
   - Output Directory: `./`
   - Install Command: `npm install`

4. **Deploy**
   - Push to main branch or trigger manual deployment
   - Vercel will build and deploy automatically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and naming conventions
- Write clear, concise commit messages
- Test thoroughly before submitting PRs
- Update documentation as needed

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Icons**: Custom SVG icons and emoji integration
- **Fonts**: Inter font family from Google Fonts
- **PDF.js**: Mozilla PDF rendering library
- **MongoDB Atlas**: Cloud database hosting
- **Vercel**: Modern deployment platform

## 📞 Support

For support or questions:

- Create an issue on GitHub
- Check the documentation
- Review the code comments

---

**Built with ❤️ using modern web technologies**
