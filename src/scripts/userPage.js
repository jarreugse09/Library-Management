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
        title: "Quantum Paradox",
        author: "Marcus R. Fielding",
        genre: "Sci-Fi",
        description: "A physicist accidentally creates a time rift and must fix it before alternate realities collapse into chaos.",
        image: "/images/OIP.jpg",
    },
    {
        title: "Culinary Journeys",
        author: "Sophia Laurent",
        genre: "Non-Fiction",
        description: "Explore world cuisines through the eyes of a Michelin-star chef who traveled to 50 countries in 5 years.",
        image: "/images/OIP.jpg",
    },
    {
        title: "The Forgotten Crown",
        author: "Arthur Pendleton",
        genre: "Fantasy",
        description: "A lost heir discovers their royal lineage and must reclaim a magical throne from an ancient evil.",
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

// Function to display books
function displayBooks() {
    const bookList = document.getElementById("bookList");

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