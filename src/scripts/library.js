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
];


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

// Add event listener to the exit button
document.addEventListener("DOMContentLoaded", () => {
    const exitButton = document.getElementById("closeBookInfo");
    if (exitButton) {
        exitButton.addEventListener("click", hideBookInfo);
    }

    // Call the function to display books
    displayBooks();
});