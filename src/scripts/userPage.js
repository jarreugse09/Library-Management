// Array of books
const books = [
    {
        title: "Book Title 1",
        author: "Author Name 1",
        genre: "Fiction",
        image: "../images/OIP.jpg",
    },
    {
        title: "Book Title 2",
        author: "Author Name 2",
        genre: "Non-Fiction",
        image: "../images/OIP.jpg",
    },
    {
        title: "Book Title 3",
        author: "Author Name 3",
        genre: "Mystery",
        image: "../images/OIP.jpg",
    },
    {
        title: "Book Title 4",
        author: "Author Name 4",
        genre: "Fantasy",
        image: "../images/OIP.jpg",
    },
    {
        title: "Book Title 5",
        author: "Author Name 5",
        genre: "Science",
        image: "../images/OIP.jpg",
    },
];

// Function to display books
function displayBooks() {
    const bookList = document.getElementById("bookList");

    books.forEach((book) => {
        const bookItem = document.createElement("div");
        bookItem.classList.add("book-item");

        bookItem.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Genre: ${book.genre}</p>
        `;

        bookList.appendChild(bookItem);
    });
}

// Call the function to display books when the page loads
document.addEventListener("DOMContentLoaded", displayBooks);