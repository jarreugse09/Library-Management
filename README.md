#  LibraLink – Library Management System

A **modern full-stack library system** for managing books, users, borrowings, and community interactions — all with a sleek, responsive interface.

---

## Technology Stack

<div align="center">

### Backend

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)  
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)  
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)  
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSONwebtokens&logoColor=white)](https://jwt.io/)  

### Frontend

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)  
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)  
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)  
[![PDF.js](https://img.shields.io/badge/PDF.js-000000?style=for-the-badge&logo=mozilla&logoColor=white)](https://mozilla.github.io/pdf.js/)  

### Deployment & Tools

[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)  
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)  
[![nodemon](https://img.shields.io/badge/nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white)](https://nodemon.io/)  

</div>

---


##  Features

###  User Management
- Role-based authentication: Admin, Librarian, Clerk, User  
- Secure login: JWT & bcrypt  
- Email OTP verification  
- Profile & permissions management  

### Book Management
- Physical books & e-books  
- Catalog: title, author, genre, description, year  
- Cover images & PDF uploads  
- Donation workflow with approval  
- Inventory tracking  

### Borrowing System
- Borrow requests with approval workflow  
- Due date & status tracking (pending, approved, rejected, returned, lost)  

### Social Features
- 5-star ratings & comments  
- Saved books & reading lists  
- E-book reading progress  
- Community discussion posts  

### Modern UI/UX
- Responsive (desktop, tablet, mobile)  
- Dark theme & glassmorphism  
- Smooth animations & accessible design  

### Admin Tools
- Dashboard analytics  
- User & book management  
- Audit logs & genre management  


## Installation

```bash
# Clone repo
git clone https://github.com/jarreugse09/Library-Management.git
cd Library-Management

# Install dependencies
npm install

# Create .env with your MongoDB & email settings
# (See original README for environment variables)

# Optional: seed database
npm run seed

# Run locally
npm run dev
```
Visit http://localhost:7001
