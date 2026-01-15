const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv").config();

// Import all models
const User = require("./models/userModel");
const Book = require("./models/bookModel");
const Borrow = require("./models/borrowModel");
const Rating = require("./models/ratingModel");
const SavedBook = require("./models/savedBookModel");
const ReadBook = require("./models/readBookModel");
const Genre = require("./models/genreModel");
const Log = require("./models/logModel");
const Comment = require("./models/commentModel");
const Post = require("./models/postModel");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    await Borrow.deleteMany({});
    await Rating.deleteMany({});
    await SavedBook.deleteMany({});
    await ReadBook.deleteMany({});
    await Genre.deleteMany({});
    await Log.deleteMany({});
    await Comment.deleteMany({});
    await Post.deleteMany({});
    console.log("Cleared existing data");

    // Seed Genres
    const genres = await Genre.insertMany([
      { name: "Fiction" },
      { name: "Non-Fiction" },
      { name: "Science Fiction" },
      { name: "Fantasy" },
      { name: "Mystery" },
      { name: "Romance" },
      { name: "Thriller" },
      { name: "Biography" },
      { name: "History" },
      { name: "Self-Help" },
      { name: "Technology" },
      { name: "Health" },
      { name: "Travel" },
      { name: "Cooking" },
      { name: "Art" },
      { name: "Music" },
      { name: "Sports" },
      { name: "Education" },
      { name: "Philosophy" },
      { name: "Religion" },
      { name: "Horror" },
      { name: "Comedy" },
      { name: "Drama" },
      { name: "Poetry" },
      { name: "Adventure" },
      { name: "Western" },
      { name: "Crime" },
      { name: "War" },
      { name: "Espionage" },
      { name: "Supernatural" },
    ]);
    console.log("Seeded genres");

    // Seed Users
    const hashedPassword = await bcrypt.hash("password123", 10);
    const users = await User.insertMany([
      {
        firstName: "Admin",
        lastName: "User",
        username: "admin",
        email: "admin@libralink.com",
        password: hashedPassword,
        role: "admin",
        otp: generateOTP(),
        isVerified: true,
        status: "active",
      },
      {
        firstName: "Librarian",
        lastName: "One",
        username: "librarian1",
        email: "librarian1@libralink.com",
        password: hashedPassword,
        role: "librarian",
        otp: generateOTP(),
        isVerified: true,
        status: "active",
      },
      {
        firstName: "Clerk",
        lastName: "One",
        username: "clerk1",
        email: "clerk1@libralink.com",
        password: hashedPassword,
        role: "clerk",
        otp: generateOTP(),
        isVerified: true,
        status: "active",
      },
      {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: hashedPassword,
        role: "user",
        otp: generateOTP(),
        isVerified: true,
        status: "active",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        username: "janesmith",
        email: "jane@example.com",
        password: hashedPassword,
        role: "user",
        otp: generateOTP(),
        isVerified: true,
        status: "active",
      },
      {
        firstName: "Bob",
        lastName: "Johnson",
        username: "bobjohnson",
        email: "bob@example.com",
        password: hashedPassword,
        role: "user",
        otp: generateOTP(),
        isVerified: true,
        status: "active",
      },
      {
        firstName: "Alice",
        lastName: "Brown",
        username: "alicebrown",
        email: "alice@example.com",
        password: hashedPassword,
        role: "user",
        otp: generateOTP(),
        isVerified: true,
        status: "active",
      },
      {
        firstName: "Charlie",
        lastName: "Wilson",
        username: "charliewilson",
        email: "charlie@example.com",
        password: hashedPassword,
        role: "user",
        otp: generateOTP(),
        isVerified: true,
        status: "active",
      },
      {
        firstName: "Diana",
        lastName: "Davis",
        username: "dianadavis",
        email: "diana@example.com",
        password: hashedPassword,
        role: "user",
        otp: generateOTP(),
        isVerified: true,
        status: "active",
      },
      {
        firstName: "Eve",
        lastName: "Miller",
        username: "evemiller",
        email: "eve@example.com",
        password: hashedPassword,
        role: "user",
        otp: generateOTP(),
        isVerified: true,
        status: "active",
      },
    ]);
    console.log("Seeded users");

    // Seed Books
    const books = await Book.insertMany([
      {
        title: "The Great Gatsby",
        description: "A classic American novel set in the Jazz Age.",
        authors: ["F. Scott Fitzgerald"],
        publishedYear: 1925,
        donorId: users[3]._id, // John Doe
        bookType: "physical",
        genre: ["Fiction", "Drama"],
        quantity: 5,
        maxQuantity: 5,
        shelfLocation: "A1-01",
        status: "good",
        condition: "good",
        isApprove: true,
        isDone: true,
        coverImageUrl: "/uploads/covers/1.jpg",
      },
      {
        title: "To Kill a Mockingbird",
        description:
          "A gripping tale of racial injustice and childhood innocence.",
        authors: ["Harper Lee"],
        publishedYear: 1960,
        donorId: users[4]._id, // Jane Smith
        bookType: "physical",
        genre: ["Fiction", "Drama"],
        quantity: 3,
        maxQuantity: 3,
        shelfLocation: "A1-02",
        status: "good",
        condition: "good",
        isApprove: true,
        isDone: true,
        coverImageUrl: "/uploads/covers/2.jpg",
      },
      {
        title: "1984",
        description: "A dystopian social science fiction novel.",
        authors: ["George Orwell"],
        publishedYear: 1949,
        donorId: users[5]._id, // Bob Johnson
        bookType: "physical",
        genre: ["Fiction", "Science Fiction", "Dystopian"],
        quantity: 4,
        maxQuantity: 4,
        shelfLocation: "A1-03",
        status: "good",
        condition: "good",
        isApprove: true,
        isDone: true,
        coverImageUrl: "/uploads/covers/3.jpg",
      },
      {
        title: "Pride and Prejudice",
        description: "A romantic novel of manners.",
        authors: ["Jane Austen"],
        publishedYear: 1813,
        donorId: users[6]._id, // Alice Brown
        bookType: "physical",
        genre: ["Fiction", "Romance"],
        quantity: 2,
        maxQuantity: 2,
        shelfLocation: "A1-04",
        status: "good",
        condition: "good",
        isApprove: true,
        isDone: true,
        coverImageUrl: "/uploads/covers/4.jpg",
      },
      {
        title: "The Catcher in the Rye",
        description: "A controversial novel about teenage rebellion.",
        authors: ["J.D. Salinger"],
        publishedYear: 1951,
        donorId: users[7]._id, // Charlie Wilson
        bookType: "physical",
        genre: ["Fiction", "Coming-of-Age"],
        quantity: 3,
        maxQuantity: 3,
        shelfLocation: "A1-05",
        status: "good",
        condition: "good",
        isApprove: true,
        isDone: true,
        coverImageUrl: "/uploads/covers/5.jpg",
      },
      {
        title: "The Hobbit",
        description: "A fantasy adventure novel.",
        authors: ["J.R.R. Tolkien"],
        publishedYear: 1937,
        donorId: users[8]._id, // Diana Davis
        bookType: "ebook",
        genre: ["Fantasy", "Adventure"],
        ebookFileUrl: "/uploads/ebooks/ebookFile-1746801981351-598677318.pdf",
        coverImageUrl: "/uploads/covers/coverImage-1746801981350-567157648.jpg",
        status: "good",
        condition: "new",
        isApprove: true,
        isDone: true,
      },
      {
        title: "Dune",
        description: "A science fiction epic.",
        authors: ["Frank Herbert"],
        publishedYear: 1965,
        donorId: users[9]._id, // Eve Miller
        bookType: "ebook",
        genre: ["Science Fiction", "Adventure"],
        ebookFileUrl: "/uploads/ebooks/ebookFile-1746942094777-757248006.pdf",
        coverImageUrl: "/uploads/covers/coverImage-1746942094768-779400439.jpg",
        status: "good",
        condition: "new",
        isApprove: true,
        isDone: true,
      },
      {
        title: "The Lord of the Rings",
        description: "An epic fantasy trilogy.",
        authors: ["J.R.R. Tolkien"],
        publishedYear: 1954,
        donorId: users[3]._id, // John Doe
        bookType: "ebook",
        genre: ["Fantasy", "Adventure"],
        ebookFileUrl: "/uploads/ebooks/ebookFile-1747054719022-443060742.pdf",
        coverImageUrl: "/uploads/covers/coverImage-1747054719806-434216107.jpg",
        status: "good",
        condition: "new",
        isApprove: true,
        isDone: true,
      },
      {
        title: "Harry Potter and the Philosopher's Stone",
        description: "A magical adventure for young readers.",
        authors: ["J.K. Rowling"],
        publishedYear: 1997,
        donorId: users[4]._id, // Jane Smith
        bookType: "physical",
        genre: ["Fantasy", "Adventure"],
        quantity: 6,
        maxQuantity: 6,
        shelfLocation: "B1-01",
        status: "good",
        condition: "good",
        isApprove: true,
        isDone: true,
        coverImageUrl: "/uploads/covers/6.jpg",
      },
      {
        title: "The Da Vinci Code",
        description: "A mystery thriller involving secret societies.",
        authors: ["Dan Brown"],
        publishedYear: 2003,
        donorId: users[5]._id, // Bob Johnson
        bookType: "physical",
        genre: ["Mystery", "Thriller"],
        quantity: 4,
        maxQuantity: 4,
        shelfLocation: "B1-02",
        status: "good",
        condition: "good",
        isApprove: true,
        isDone: true,
        coverImageUrl: "/uploads/covers/7.jpg",
      },
    ]);
    console.log("Seeded books");

    // Seed Borrows
    const borrows = await Borrow.insertMany([
      {
        borrowedBookId: books[0]._id,
        bookTitle: books[0].title,
        borrowerName: "John Doe",
        contactInfo: "john@example.com",
        borrowDate: new Date("2024-01-15"),
        returnDate: new Date("2024-02-15"),
        notes: "For personal reading",
        status: "approved",
      },
      {
        borrowedBookId: books[1]._id,
        bookTitle: books[1].title,
        borrowerName: "Jane Smith",
        contactInfo: "jane@example.com",
        borrowDate: new Date("2024-01-20"),
        returnDate: new Date("2024-02-20"),
        notes: "Class assignment",
        status: "returned",
      },
      {
        borrowedBookId: books[2]._id,
        bookTitle: books[2].title,
        borrowerName: "Bob Johnson",
        contactInfo: "bob@example.com",
        borrowDate: new Date("2024-01-25"),
        returnDate: new Date("2024-02-25"),
        notes: "Research project",
        status: "pending",
      },
    ]);
    console.log("Seeded borrows");

    // Seed Ratings
    const ratings = await Rating.insertMany([
      {
        user: users[3]._id, // John Doe
        bookId: books[0]._id,
        rating: 5,
      },
      {
        user: users[4]._id, // Jane Smith
        bookId: books[1]._id,
        rating: 4,
      },
      {
        user: users[5]._id, // Bob Johnson
        bookId: books[2]._id,
        rating: 5,
      },
      {
        user: users[6]._id, // Alice Brown
        bookId: books[3]._id,
        rating: 4,
      },
      {
        user: users[7]._id, // Charlie Wilson
        bookId: books[4]._id,
        rating: 3,
      },
      {
        user: users[8]._id, // Diana Davis
        bookId: books[5]._id,
        rating: 5,
      },
      {
        user: users[9]._id, // Eve Miller
        bookId: books[6]._id,
        rating: 4,
      },
      {
        user: users[3]._id, // John Doe
        bookId: books[7]._id,
        rating: 5,
      },
      {
        user: users[4]._id, // Jane Smith
        bookId: books[8]._id,
        rating: 4,
      },
      {
        user: users[5]._id, // Bob Johnson
        bookId: books[9]._id,
        rating: 4,
      },
    ]);
    console.log("Seeded ratings");

    // Update book average ratings
    for (let book of books) {
      const bookRatings = ratings.filter(
        (r) => r.bookId.toString() === book._id.toString()
      );
      if (bookRatings.length > 0) {
        const avgRating =
          bookRatings.reduce((sum, r) => sum + r.rating, 0) /
          bookRatings.length;
        book.averageRating = avgRating;
        book.ratingCount = bookRatings.length;
        await book.save();
      }
    }
    console.log("Updated book ratings");

    // Seed Saved Books
    const savedBooks = await SavedBook.insertMany([
      {
        userId: users[3]._id, // John Doe
        bookId: books[1]._id,
      },
      {
        userId: users[4]._id, // Jane Smith
        bookId: books[0]._id,
      },
      {
        userId: users[5]._id, // Bob Johnson
        bookId: books[3]._id,
      },
      {
        userId: users[6]._id, // Alice Brown
        bookId: books[5]._id,
      },
      {
        userId: users[7]._id, // Charlie Wilson
        bookId: books[6]._id,
      },
    ]);
    console.log("Seeded saved books");

    // Seed Read Books
    const readBooks = await ReadBook.insertMany([
      {
        bookId: books[5]._id, // The Hobbit (ebook)
        userId: users[3]._id, // John Doe
        pageNumber: 150,
      },
      {
        bookId: books[6]._id, // Dune (ebook)
        userId: users[4]._id, // Jane Smith
        pageNumber: 200,
      },
      {
        bookId: books[7]._id, // Lord of the Rings (ebook)
        userId: users[5]._id, // Bob Johnson
        pageNumber: 300,
      },
    ]);
    console.log("Seeded read books");

    // Seed Comments
    const comments = await Comment.insertMany([
      {
        user: users[3]._id, // John Doe
        book: books[0]._id,
        content: "A timeless classic that everyone should read!",
      },
      {
        user: users[4]._id, // Jane Smith
        book: books[1]._id,
        content: "Powerful story about justice and morality.",
      },
      {
        user: users[5]._id, // Bob Johnson
        book: books[2]._id,
        content: "Orwell's vision of the future is eerily relevant today.",
      },
      {
        user: users[6]._id, // Alice Brown
        book: books[3]._id,
        content: "Jane Austen's wit and social commentary are unmatched.",
      },
      {
        user: users[7]._id, // Charlie Wilson
        book: books[4]._id,
        content: "A controversial but important coming-of-age story.",
      },
    ]);
    console.log("Seeded comments");

    // Seed Posts
    const posts = await Post.insertMany([
      {
        title: "Book Review: The Great Gatsby",
        authors: ["F. Scott Fitzgerald"],
        description: "My thoughts on this American classic...",
        username: "johndoe",
        user: users[3]._id, // John Doe
        likes: 15,
        dislikes: 2,
        comments: [
          {
            user: users[4]._id,
            username: "janesmith",
            content: "Great review! I agree with your points.",
            createdAt: new Date(),
          },
          {
            user: users[5]._id,
            username: "bobjohnson",
            content: "Interesting perspective on the themes.",
            createdAt: new Date(),
          },
        ],
      },
      {
        title: "Why 1984 is Still Relevant",
        authors: ["George Orwell"],
        description: "Discussing the themes of surveillance and truth...",
        username: "bobjohnson",
        user: users[5]._id, // Bob Johnson
        likes: 22,
        dislikes: 1,
        comments: [
          {
            user: users[6]._id,
            username: "alicebrown",
            content: "Very timely discussion!",
            createdAt: new Date(),
          },
        ],
      },
      {
        title: "Fantasy Recommendations",
        authors: ["Various"],
        description: "My favorite fantasy books to read...",
        username: "dianadavis",
        user: users[8]._id, // Diana Davis
        likes: 18,
        dislikes: 0,
        comments: [],
      },
    ]);
    console.log("Seeded posts");

    // Seed Logs
    const logs = await Log.insertMany([
      {
        type: "DONATION",
        refId: books[0]._id,
        action: "approved",
        role: "clerk",
        timestamp: new Date("2024-01-10"),
      },
      {
        type: "BORROW",
        refId: borrows[0]._id,
        action: "approved",
        role: "librarian",
        timestamp: new Date("2024-01-15"),
      },
      {
        type: "ENCODED BY CLERK",
        refId: books[5]._id,
        action: "done",
        role: "clerk",
        timestamp: new Date("2024-01-12"),
      },
      {
        type: "DONATION",
        refId: books[1]._id,
        action: "rejected",
        role: "librarian",
        timestamp: new Date("2024-01-08"),
      },
      {
        type: "BORROW",
        refId: borrows[1]._id,
        action: "done",
        role: "librarian",
        timestamp: new Date("2024-02-20"),
      },
    ]);
    console.log("Seeded logs");

    console.log("Database seeded successfully!");
    console.log("\nSample Login Credentials:");
    console.log("Admin: admin / password123");
    console.log("Clerk: clerk1 / password123");
    console.log("Users: johndoe, janesmith, etc. / password123");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();
