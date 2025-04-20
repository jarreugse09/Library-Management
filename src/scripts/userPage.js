// Array of books
const books = [
    {
        title: "Book Title 1",
        author: "Author Name 1",
        genre: "Fiction",
        description: "This is a brief description of Book Title 1.",
        image: "/images/OIP.jpg",
    },
    {
        title: "Book Title 2",
        author: "Author Name 2",
        genre: "Non-Fiction",
        description: "This is a brief description of Book Title 2.",
        image: "/images/OIP.jpg",
    },
    {
        title: "Book Title 3",
        author: "Author Name 3",
        genre: "Mystery",
        description: "This is a brief description of Book Title 3.",
        image: "/images/OIP.jpg",
    },
    {
        title: "Book Title 4",
        author: "Author Name 4",
        genre: "Fiction",
        description: "This is a brief description of Book Title 4.",
        image: "/images/OIP.jpg",
    },
    {
        title: "Book Title 5",
        author: "Author Name 5",
        genre: "Non-Fiction",
        description: "This is a brief description of Book Title 5.",
        image: "/images/OIP.jpg",
    },
    {
        title: "Book Title 6",
        author: "Author Name 6",
        genre: "Mystery",
        description: "This is a brief description of Book Title 6.",
        image: "/images/OIP.jpg",
    },
    {
        title: "Book Title 7",
        author: "Author Name 7",
        genre: "Fantasy",
        description: "This is a brief description of Book Title 5.",
        image: "/images/OIP.jpg",
    },
    {
        title: "Book Title 8",
        author: "Author Name 8",
        genre: "Science",
        description: "This is a brief description of Book Title 6.",
        image: "/images/OIP.jpg",
    },
];

// Function to display all books
function displayBooks() {
    const bookList = document.getElementById("bookList");
    bookList.innerHTML = "";

    books.forEach((book, index) => {
        const bookItem = document.createElement("div");
        bookItem.classList.add("book-item");

        bookItem.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Genre: ${book.genre}</p>
        `;

        bookItem.addEventListener("click", () => showBookDetails(index));
        bookList.appendChild(bookItem);
    });
}

// Function to display books by genre
function displayBooksByGenre(genre) {
    if (genre === "All") {
        displayBooks();
        return;
    }

    const bookList = document.getElementById("bookList");
    bookList.innerHTML = "";

    const filteredBooks = books.filter(book => book.genre === genre);

    filteredBooks.forEach((book) => {
        const bookItem = document.createElement("div");
        bookItem.classList.add("book-item");

        bookItem.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Genre: ${book.genre}</p>
        `;

        const index = books.indexOf(book);
        bookItem.addEventListener("click", () => showBookDetails(index));
        bookList.appendChild(bookItem);
    });
}

// Function to show book details
function showBookDetails(index) {
    const bookDetails = document.getElementById("bookDetails");
    const bookInfo = document.querySelector(".book-info");
    const book = books[index];

    bookDetails.innerHTML = `
        <img src="${book.image}" alt="${book.title}">
        <h3>${book.title}</h3>
        <p>Author: ${book.author}</p>
        <p>Genre: ${book.genre}</p>
        <p>Description: ${book.description}</p>
    `;

    bookInfo.style.display = "block";
}

// Function to hide the book-info section
function hideBookInfo() {
    const bookInfo = document.querySelector(".book-info");
    bookInfo.style.display = "none";
}

// Function to query books by title
function queryBookByTitle(title) {
    const lowerCaseTitle = title.toLowerCase();
    return books.filter((book) => book.title.toLowerCase().includes(lowerCaseTitle));
}

// Function to search books
function searchBooks() {
    const searchInput = document.querySelector(".search-bar input").value;
    const results = queryBookByTitle(searchInput);

    const bookList = document.getElementById("bookList");
    bookList.innerHTML = "";

    results.forEach((book, index) => {
        const bookItem = document.createElement("div");
        bookItem.classList.add("book-item");

        bookItem.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Genre: ${book.genre}</p>
        `;

        bookItem.addEventListener("click", () => showBookDetails(index));
        bookList.appendChild(bookItem);
    });
}

// DOM ready logic
document.addEventListener("DOMContentLoaded", () => {
    const exitButton = document.getElementById("closeBookInfo");
    if (exitButton) {
        exitButton.addEventListener("click", hideBookInfo);
    }

    displayBooks(); // Show all books initially

    const searchBar = document.querySelector(".search-bar input");
    if (searchBar) {
        searchBar.addEventListener("input", searchBooks);
    }

    // Genre filter click
    const genreLinks = document.querySelectorAll("#genreList a");
    genreLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const genre = link.textContent.trim();
            displayBooksByGenre(genre);
            hideBookInfo();
        });
    });
});
