const { fileURLToPath } = require('url');
const { dirname, join } = require('path');
const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const checkReferer = require('./middlewares/checkReferer');
const mongoSanitize = require('./middlewares/mongoSanitize');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const appRoutes = require('./routes/appRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const donationRoutes = require('./routes/donationRoutes');
const ebookRoutes = require('./routes/ebookRoutes');
const physicalBookRoutes = require('./routes/physicalBookRoutes');
const genreRoutes = require('./routes/genreRoutes');
const authControllers = require('./controllers/authControllers');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(
  '/styles',
  checkReferer,
  express.static(join(__dirname, 'styles'))
);

app.use(
  '/scripts',
  checkReferer,
  express.static(join(__dirname, 'scripts'))
);
app.use(
  '/uploads',
  express.static(join(__dirname, 'uploads'))
);
app.use(
  '/images',
  express.static(join(__dirname, 'images'))
);

app.use('/', appRoutes);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(mongoSanitize);
app.use(cors());

app.use('/api/auth', authRoutes);
app.use(
  '/api/donations',
  authControllers.protect,
  donationRoutes
);
app.use(
  '/api/books/physical',
  authControllers.protect,
  physicalBookRoutes
);
app.use(
  '/api/books/ebook',
  authControllers.protect,
  ebookRoutes
);
app.use(
  '/api/books/genre',
  authControllers.protect,
  genreRoutes
);
app.use(
  '/api/borrows',
  authControllers.protect,
  borrowRoutes
);
app.use('/api/dashboard/', dashboardRoutes);
app.use(
  '/api/users',
  authControllers.protect,
  userRoutes
);
// app.use('/api/donations', donationRoutes);
// app.use('/api/books/physical', physicalBookRoutes);
// app.use('/api/books/ebook', ebookRoutes);
// app.use('/api/books/genre', genreRoutes);
// app.use('/api/borrows', borrowRoutes);

const PORT = process.env.PORT || 7002;

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() =>
    console.log(
      'Successfully Connected to MongoDB Atlas'
    )
  )
  .catch(err =>
    console.error(
      'MongoDB connection error:',
      err
    )
  );

app.listen(PORT, () => {
  console.log(
    `Server is Running at port ${PORT}`
  );
});
