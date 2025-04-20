// Array of books
const books = [
    {
        title: "The Silent Echo",
        author: "Emily Winters",
        genre: "Mystery",
        description: "A detective uncovers dark secrets in a small coastal town where everyone hears whispers but no one speaks the truth.",
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
        title: "Culinary Journeys",
        author: "Sophia Laurent",
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
    {
        title: "Neon Shadows",
        author: "Jax Teller",
        genre: "Cyberpunk",
        description: "In a dystopian megacity, a hacker and a rogue AI team up to take down a corrupt corporate empire.",
        image: "/images/OIP.jpg",
    },
    {
        title: "Love in Transit",
        author: "Clara Bennett",
        genre: "Romance",
        description: "Two strangers meet on a cross-country train and find their lives intertwined in unexpected ways.",
        image: "/images/OIP.jpg",
    },
    {
        title: "Mind Over Matter",
        author: "Dr. Rebecca Stone",
        genre: "Psychology",
        description: "Groundbreaking research on how thoughts influence physical reality, with case studies from top neuroscientists.",
        image: "/images/OIP.jpg",
    },
    {
        title: "The Last Expedition",
        author: "Captain Henry Walsh",
        genre: "Adventure",
        description: "The harrowing true story of a 19th-century Arctic expedition that vanished for three years.",
        image: "/images/OIP.jpg",
    },
    {
        title: "Codebreaker",
        author: "Lisa Zhang",
        genre: "Thriller",
        description: "A cryptanalyst races against time to stop a terrorist plot hidden in plain sight within social media algorithms.",
        image: "/images/OIP.jpg",
    },
    {
        title: "Petals in the Storm",
        author: "Eleanor Hart",
        genre: "Historical Fiction",
        description: "A WWII nurse and a resistance fighter risk everything to smuggle Jewish children out of occupied France.",
        image: "/images/OIP.jpg",
    },
    {
        title: "Zero Gravity",
        author: "Neil Cosmos",
        genre: "Hard Sci-Fi",
        description: "The first manned mission to Europa uncovers evidence of extraterrestrial life beneath the ice.",
        image: "/images/OIP.jpg",
    },
    {
        title: "The Alchemist's Kitchen",
        author: "Genevieve LeFevre",
        genre: "Magical Realism",
        description: "A Parisian chef discovers her grandmother's recipe book can alter reality through flavors and memories.",
        image: "/images/OIP.jpg",
    }
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
        <div class="book-meta">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-genre">${book.genre}</p>
        </div>
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
    const searchInput = document.querySelector(".search-wrapper input").value;
    const results = queryBookByTitle(searchInput);

    const bookList = document.getElementById("bookList");
    bookList.innerHTML = "";

results.forEach((book, index) => {
    const bookItem = document.createElement("div");
    bookItem.classList.add("book-item-horizontal");

    bookItem.innerHTML = `
        <img src="${book.image}" alt="${book.title}" class="book-cover">
        <div class="book-meta">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">Author: ${book.author}</p>
            <p class="book-genre">Genre: ${book.genre}</p>
        </div>
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

    const searchBar = document.querySelector(".search-wrapper input");
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
