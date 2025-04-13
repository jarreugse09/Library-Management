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
        description: "This is a brief description of Book Title 1.",
        image: "/images/OIP.jpg",
    },
    {
        title: "Book Title 5",
        author: "Author Name 5",
        genre: "Non-Fiction",
        description: "This is a brief description of Book Title 2.",
        image: "/images/OIP.jpg",
    },
    {
        title: "Book Title 5",
        author: "Author Name 6",
        genre: "Mystery",
        description: "This is a brief description of Book Title 3.",
        image: "/images/OIP.jpg",
    },
];

// Function to display books
function displayBooks() {
    const bookList = document.getElementById("bookList");

    books.forEach((book, index) => {
        const bookItem = document.createElement("div");
        bookItem.classList.add("book-item");

        bookItem.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Genre: ${book.genre}</p>
        `;

        // Add click event to show book details
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

    // Make the book-info section visible
    bookInfo.style.display = "block";
}

// Function to hide the book-info section
function hideBookInfo() {
    console.log("Hiding book-info section");
    const bookInfo = document.querySelector(".book-info");
    bookInfo.style.display = "none";
}

// Function to query books by title
function queryBookByTitle(title) {
    const lowerCaseTitle = title.toLowerCase(); // Convert the title to lowercase for case-insensitive search
    return books.filter((book) => book.title.toLowerCase().includes(lowerCaseTitle));
}

// Function to search books and display results
function searchBooks() {
    const searchInput = document.querySelector(".search-bar input").value;
    const results = queryBookByTitle(searchInput); // Query books by title

    const bookList = document.getElementById("bookList");
    bookList.innerHTML = ""; // Clear the current book list

    results.forEach((book, index) => {
        const bookItem = document.createElement("div");
        bookItem.classList.add("book-item");

        bookItem.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Genre: ${book.genre}</p>
        `;

        // Add click event to show book details
        bookItem.addEventListener("click", () => showBookDetails(index));

        bookList.appendChild(bookItem);
    });
}

// Add event listener to the exit button
document.addEventListener("DOMContentLoaded", () => {
    const exitButton = document.getElementById("closeBookInfo");
    if (exitButton) {
        exitButton.addEventListener("click", hideBookInfo);
    }

    // Call the function to display books
    displayBooks();
});

// Add event listener to the search bar
document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.querySelector(".search-bar input");
    if (searchBar) {
        searchBar.addEventListener("input", searchBooks); // Trigger search on input
    }
});