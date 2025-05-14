// Array of books
// const books = [
//     {
//         title: "The Silent Echo",
//         author: "Emily Winters",
//         genre: "Mystery",
//         description: "A detective uncovers dark secrets in a small coastal town where everyone hears whispers but no one speaks the truth.",
//         image: "/images/OIP.jpg",
//     },
//     {
//         title: "Book Title 4",
//         author: "Author Name 4",
//         genre: "Fiction",
//         description: "This is a brief description of Book Title 4.",
//         image: "/images/OIP.jpg",
//     },
//     {
//         title: "Culinary Journeys",
//         author: "Sophia Laurent",
//         genre: "Non-Fiction",
//         description: "This is a brief description of Book Title 5.",
//         image: "/images/OIP.jpg",
//     },
//     {
//         title: "Book Title 6",
//         author: "Author Name 6",
//         genre: "Mystery",
//         description: "This is a brief description of Book Title 6.",
//         image: "/images/OIP.jpg",
//     },
//     {
//         title: "Book Title 7",
//         author: "Author Name 7",
//         genre: "Fantasy",
//         description: "This is a brief description of Book Title 5.",
//         image: "/images/OIP.jpg",
//     },
//     {
//         title: "Book Title 8",
//         author: "Author Name 8",
//         genre: "Science",
//         description: "This is a brief description of Book Title 6.",
//         image: "/images/OIP.jpg",
//     },
//     {
//         title: "Neon Shadows",
//         author: "Jax Teller",
//         genre: "Cyberpunk",
//         description: "In a dystopian megacity, a hacker and a rogue AI team up to take down a corrupt corporate empire.",
//         image: "/images/OIP.jpg",
//     },
//     {
//         title: "Love in Transit",
//         author: "Clara Bennett",
//         genre: "Romance",
//         description: "Two strangers meet on a cross-country train and find their lives intertwined in unexpected ways.",
//         image: "/images/OIP.jpg",
//     },
//     {
//         title: "Mind Over Matter",
//         author: "Dr. Rebecca Stone",
//         genre: "Psychology",
//         description: "Groundbreaking research on how thoughts influence physical reality, with case studies from top neuroscientists.",
//         image: "/images/OIP.jpg",
//     },
//     {
//         title: "The Last Expedition",
//         author: "Captain Henry Walsh",
//         genre: "Adventure",
//         description: "The harrowing true story of a 19th-century Arctic expedition that vanished for three years.",
//         image: "/images/OIP.jpg",
//     },
//     {
//         title: "Codebreaker",
//         author: "Lisa Zhang",
//         genre: "Thriller",
//         description: "A cryptanalyst races against time to stop a terrorist plot hidden in plain sight within social media algorithms.",
//         image: "/images/OIP.jpg",
//     },
//     {
//         title: "Petals in the Storm",
//         author: "Eleanor Hart",
//         genre: "Historical Fiction",
//         description: "A WWII nurse and a resistance fighter risk everything to smuggle Jewish children out of occupied France.",
//         image: "/images/OIP.jpg",
//     },
//     {
//         title: "Zero Gravity",
//         author: "Neil Cosmos",
//         genre: "Hard Sci-Fi",
//         description: "The first manned mission to Europa uncovers evidence of extraterrestrial life beneath the ice.",
//         image: "/images/OIP.jpg",
//     },
//     {
//         title: "The Alchemist's Kitchen",
//         author: "Genevieve LeFevre",
//         genre: "Magical Realism",
//         description: "A Parisian chef discovers her grandmother's recipe book can alter reality through flavors and memories.",
//         image: "/images/OIP.jpg",
//     }
// ];
let user;
let myBooks = [];
let ebooks = [];
let physicalBooks = [];
let savedBook = [];
let donatedBook = [];

const token = localStorage.getItem('jwt');

if (!token) {
  alert('You must be logged in to view this page.');
  window.location.href = '/';
}
// DOM Elements
const myBookListEl = document.getElementById('myBookList');
const browseBookListEl = document.getElementById('browseList');

async function fetchBooks() {
  try {
    const res = await fetch(`/api/books/ebook/my-book/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    myBooks.splice(0, myBooks.length, ...(data.books || []));

    displayBooks(myBooks, myBookListEl);
  } catch (err) {
    console.error('Error fetching My Books:', err);
  }
}

async function logoutUser() {
  try {
    const token = localStorage.getItem('jwt');

    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.removeItem('jwt'); // Remove JWT

    alert('You have been successfully logged out.');

    window.location.href = '/'; // Redirect to login or home page
  } catch (err) {
    console.error('Logout failed', err);
    alert('Logout failed. Please try again.');
  }
}

async function fetchBrowseEbook() {
  const removeBtn = document.getElementById('removeToLibrary');
  const addToLibraryBtn = document.getElementById('addToLibrary');

  removeBtn.style.display = 'none';
  addToLibraryBtn.style.display = 'block';
  try {
    const res = await fetch(`/api/books/ebook/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    ebooks.splice(0, ebooks.length, ...(data.books || []));
    displayBooks(ebooks, browseBookListEl);
  } catch (err) {
    console.error('Error fetching Browse books:', err);
  }
}

async function fetchBrowsePhysicalBook() {
  const removeBtn = document.getElementById('removeToLibrary');
  const addToLibraryBtn = document.getElementById('addToLibrary');

  removeBtn.style.display = 'none';
  addToLibraryBtn.style.display = 'block';
  try {
    const res = await fetch(`/api/books/physical/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    physicalBooks.splice(0, physicalBooks.length, ...(data.books || []));
    displayBooks(physicalBooks, browseBookListEl);
  } catch (err) {
    console.error('Error fetching Browse books:', err);
  }
}

async function fetchSavedBooks() {
  const removeBtn = document.getElementById('removeToLibrary');
  const addToLibraryBtn = document.getElementById('addToLibrary');

  removeBtn.style.display = 'block';
  addToLibraryBtn.style.display = 'none';
  try {
    const res = await fetch(`/api/books/ebook/my-book/saved`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    savedBook.splice(0, savedBook.length, ...(data.books || []));
    displayBooks(savedBook, myBookListEl);
  } catch (err) {
    console.error('Error fetching Browse books:', err);
  }
}

async function fetchDonatedBooks() {
  const removeBtn = document.getElementById('removeToLibrary');
  const addToLibraryBtn = document.getElementById('addToLibrary');

  removeBtn.style.display = 'none';
  addToLibraryBtn.style.display = 'block';

  try {
    const res = await fetch(`/api/donations/my-book/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    donatedBook.splice(0, donatedBook.length, ...(data.books || []));
    displayBooks(donatedBook, myBookListEl);
  } catch (err) {
    console.error('Error fetching Browse books:', err);
  }
}

function displayBooks(books, container) {
  if (!container) {
    console.error('displayBooks error: container is null');
    return;
  }
  container.innerHTML = '';

  books.forEach(book => {
    const bookItem = document.createElement('div');
    bookItem.classList.add('book-item');
    bookItem.innerHTML = `
<img 
  class="book-item-image ${!book.coverImageUrl ? 'no-image' : ''}" 
  src="${book.coverImageUrl || ''}" 
  alt="${book.title}">


      <div class="book-meta">
        <h3 class="book-title">${book.title}</h3>
        <p class="book-genre">Genre: ${book.genre}</p>
        <p class="book-author">Author: ${book.authors}</p>
        <p class="book-description">Description: ${book.description}</p>
       <p style="display: ${
         book.averageRating === undefined ? 'none' : 'block'
       };">
  Average rating: <strong>${book.averageRating?.toFixed(1) || 'N/A'}</strong> 
  (${book.ratingCount || 0} ratings)
</p>
      </div>
    `;

    bookItem.addEventListener('click', () => {
      showBookDetails(book);
    });

    container.appendChild(bookItem);
  });
}

function showBookDetails(book) {
  const bookDetails = document.getElementById('bookDetails');
  const bookInfo = document.querySelector('.book-info');

  const addToLibraryBtn = document.getElementById('addToLibrary');
  const removeToLibrary = document.getElementById('removeToLibrary');

  bookDetails.innerHTML = `
  <img 
    class="book-details-image ${!book.coverImageUrl ? 'no-image' : ''}" 
    src="${book.coverImageUrl || ''}" 
    alt="${book.title}">

  <h3>${book.title}</h3>
  <p>Author(s): ${book.authors}</p>
  <p>Genre: ${
    Array.isArray(book.genre)
      ? book.genre.map(g => g.toUpperCase()).join(', ')
      : book.genre
  }</p>
  <p>Description: ${book.description}</p>

  <div class="rating-section" style="display: ${
    book.averageRating === undefined ? 'none' : 'block'
  };">
    <p>Average Rating: <strong>${
      book.averageRating?.toFixed(1) || 'N/A'
    }</strong> (${book.ratingCount || 0} ratings)</p>

    <div class="rating-stars" data-book-id="${book._id}">
      ${[1, 2, 3, 4, 5]
        .map(
          star => `
        <span class="star" data-value="${star}">&#9733;</span>
      `
        )
        .join('')}
    </div>
    
  </div>
`;
  if (book.bookType === 'physical') {
    document.getElementById('readNowBtn').style.display = 'none';
    document.getElementById('pdfModal').style.display = 'none';
  }
  if (book.bookType === 'ebook') {
    document.getElementById('readNowBtn').style.display = 'block';
  }

  document.getElementById('readNowBtn').addEventListener('click', function () {
    const pdfUrl = book.ebookFileUrl; // e.g. from <button id="readNowBtn" data-pdf="/ebooks/book1.pdf">

    const modal = document.getElementById('pdfModal');
    const viewer = document.getElementById('pdfViewer');

    viewer.src = pdfUrl;
    modal.style.display = 'flex';
  });

  document.getElementById('closePdfBtn').addEventListener('click', function () {
    document.getElementById('pdfModal').style.display = 'none';
    document.getElementById('pdfViewer').src = '';
  });

  document.querySelectorAll('.rating-stars').forEach(container => {
    container.addEventListener('click', async e => {
      if (!e.target.classList.contains('star')) return;
      const value = Number(e.target.getAttribute('data-value'));
      const bookId = container.getAttribute('data-book-id');

      // Highlight selected stars
      container.querySelectorAll('.star').forEach(star => {
        star.classList.toggle(
          'selected',
          Number(star.getAttribute('data-value')) <= value
        );
      });

      try {
        const res = await fetch(`/api/books/ebook/${bookId}/rate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
          },
          body: JSON.stringify({ rating: value }),
        });

        const data = await res.json();
        alert(data.message || 'Rating submitted!');
      } catch (err) {
        document.getElementById('rating-status').textContent = 'Rating failed.';
      }
    });
  });

  // Remove any previous event listeners to avoid duplicate calls
  const newBtn = addToLibraryBtn.cloneNode(true);
  addToLibraryBtn.parentNode.replaceChild(newBtn, addToLibraryBtn);

  newBtn.addEventListener('click', () => addToLibrary(book));

  const remove = removeToLibrary.cloneNode(true);
  removeToLibrary.parentNode.replaceChild(remove, removeToLibrary);

  remove.addEventListener('click', () => removeToLibraryFunc(book));

  bookInfo.style.display = 'block';
}

async function addToLibrary(book) {
  try {
    const response = await fetch(
      'http://localhost:7001/api/books/ebook/my-book/save-book',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: book._id,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to save book.');
    }
    alert(data.message);
    console.log('Book saved to library:', data);
  } catch (error) {
    console.error('Failed to add book to library:', error);
  }
}

async function removeToLibraryFunc(book) {
  try {
    const response = await fetch(
      `http://localhost:7001/api/books/ebook/my-book/remove-book/${book._id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to save book.');
    }
    alert(data.message);
    console.log(data.message);
    fetchSavedBooks();
  } catch (error) {
    console.error('Failed to add book to library:', error);
  }
}

function hideBookInfo() {
  document.querySelector('.book-info').style.display = 'none';
}

function searchBooks() {
  const input = document
    .querySelector('.search-wrapper input')
    .value.toLowerCase();
  const booksToSearch =
    document.querySelector('.browse').style.display === 'block'
      ? browseBooks
      : myBooks;
  const container =
    document.querySelector('.browse').style.display === 'block'
      ? browseBookListEl
      : myBookListEl;
  const filtered = booksToSearch.filter(book =>
    book.title.toLowerCase().includes(input)
  );
  displayBooks(filtered, container);
}

async function loadGenres() {
  try {
    const response = await fetch('http://localhost:7001/api/books/genre/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const genres = await response.json();
    const genreList = document.getElementById('genreList');
    genreList.innerHTML = '';

    const allLi = document.createElement('li');
    allLi.innerHTML = `<a href="#All">ALL</a>`;
    genreList.appendChild(allLi);

    (Array.isArray(genres) ? genres : Object.values(genres)).forEach(genre => {
      if (!genre?.name) return;
      const li = document.createElement('li');
      li.innerHTML = `<a href="?genre=${
        genre.name
      }">${genre.name.toUpperCase()}</a>`;
      genreList.appendChild(li);
    });
  } catch (error) {
    console.error('Failed to load genres:', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  let user = null;

  // Fetch user info and set button visibility
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      alert('Session expired. Please log in again.');
      localStorage.removeItem('jwt');
      window.location.href = '/';
      return;
    }

    if (!response.ok) throw new Error('Fetch failed');

    user = await response.json();

    if (user.role === 'clerk') {
      document.getElementById('clerkBtn').style.display = 'block';
      document.getElementById('adminBtn').style.display = 'none';
    } else if (user.role === 'admin' || user.role === 'librarian') {
      document.getElementById('adminBtn').style.display = 'block';
      document.getElementById('clerkBtn').style.display = 'none';
    } else {
      document.getElementById('clerkBtn').style.display = 'none';
      document.getElementById('adminBtn').style.display = 'none';
    }
  } catch (err) {
    console.error(err);
    alert('Could not load user data.');
  }

  // UI interaction listeners
  document
    .getElementById('closeBookInfo')
    .addEventListener('click', hideBookInfo);
  document
    .querySelector('.search-wrapper input')
    .addEventListener('input', searchBooks);

  // Initial load

  document.querySelector('.browse').style.display = 'none';
  document.querySelector('.book-info').style.display = 'none';
  document.querySelector('.genre').style.display = 'none';
  document.querySelector('.sidebar').style.display = 'block';
  document.querySelector('.books').style.display = 'block';
  fetchBooks();
});

document.getElementById('Browse').addEventListener('click', e => {
  e.preventDefault();
  document.querySelector('.books').style.display = 'none';
  document.querySelector('.sidebar').style.display = 'none';
  document.querySelector('.browse').style.display = 'block';
  document.querySelector('.genre').style.display = 'block';
  fetchBrowseEbook();
  loadGenres();
});

document.getElementById('ebookBtn').addEventListener('click', e => {
  e.preventDefault();
  document.querySelector('.books').style.display = 'none';
  document.querySelector('.sidebar').style.display = 'none';
  document.querySelector('.browse').style.display = 'block';
  document.querySelector('.genre').style.display = 'block';
  fetchBrowseEbook();
  loadGenres();
});

document.getElementById('physicalBtn').addEventListener('click', e => {
  e.preventDefault();
  document.querySelector('.books').style.display = 'none';
  document.querySelector('.sidebar').style.display = 'none';
  document.querySelector('.browse').style.display = 'block';
  document.querySelector('.genre').style.display = 'block';
  fetchBrowsePhysicalBook();
  loadGenres();
});

document.getElementById('myBooks').addEventListener('click', e => {
  e.preventDefault();
  document.querySelector('.browse').style.display = 'none';
  document.querySelector('.book-info').style.display = 'none';
  document.querySelector('.genre').style.display = 'none';
  document.querySelector('.sidebar').style.display = 'block';
  document.querySelector('.books').style.display = 'block';
  fetchBooks();
});

document.getElementById('savedBookBtn').addEventListener('click', e => {
  e.preventDefault();
  document.querySelector('.book-info').style.display = 'none';
  document.querySelector('.browse').style.display = 'none';
  document.querySelector('.genre').style.display = 'none';
  document.querySelector('.sidebar').style.display = 'block';
  document.querySelector('.books').style.display = 'block';
  fetchSavedBooks();
});

document.getElementById('donatedBtn').addEventListener('click', e => {
  e.preventDefault();
  document.querySelector('.book-info').style.display = 'none';
  document.querySelector('.browse').style.display = 'none';
  document.querySelector('.sidebar').style.display = 'block';
  document.querySelector('.genre').style.display = 'none';
  document.querySelector('.books').style.display = 'block';
  fetchDonatedBooks();
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  logoutUser();
});
