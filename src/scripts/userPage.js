let user;
let myBooks = [];
let ebooks = [];
let physicalBooks = [];
let savedBook = [];
let donatedBook = [];
let bookRead = [];

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

async function fetchBookRead() {
  const removeBtn = document.getElementById('removeToLibrary');
  const addToLibraryBtn = document.getElementById('addToLibrary');

  removeBtn.style.display = 'none';
  addToLibraryBtn.style.display = 'block';

  try {
    const res = await fetch(`/api/books/ebook/read`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    // Pass the full books array with both book and pageNumber
    displayCurrentRead(data.books, myBookListEl);
  } catch (err) {
    console.error('Error fetching Browse books:', err);
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

    // Filter out null entries
    const cleanedBooks = data.books.filter(book => book !== null);

    // Replace contents of savedBook with cleaned data
    savedBook.splice(0, savedBook.length, ...cleanedBooks);
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

function displayCurrentRead(bookEntries, container) {
  if (!container) {
    console.error('displayBooks error: container is null');
    return;
  }
  container.innerHTML = '';

  bookEntries.forEach(entry => {
    const book = entry.book;
    const pageNumber = entry.pageNumber;

    const bookCard = document.createElement('div');
    bookCard.classList.add('book-item');
    bookCard.innerHTML = `
      <img 
        class="book-item-image ${!book.coverImageUrl ? 'no-image' : ''}" 
        src="${book.coverImageUrl || ''}" 
        alt="${book.title}">

      <div class="book-meta">
        <h3 class="book-title">${book.title}</h3>
        <p class="book-genre">Genre: ${book.genre}</p>
        <p class="book-author">Author: ${book.authors || 'Unknown'}</p>
        <p class="book-description">Description: ${
          book.description || 'No description available.'
        }</p>
        <p style="display: ${
          book.averageRating === undefined ? 'none' : 'block'
        };">
          Average rating: <strong>${
            book.averageRating?.toFixed(1) || 'N/A'
          }</strong> 
          (${book.ratingCount || 0} ratings)
        </p>
        <p>Currently page: ${pageNumber}</p>
      </div>
    `;

    container.appendChild(bookCard);

    bookCard.addEventListener('click', () => {
      showReadBook(book, pageNumber);
    });
  });
}

function showReadBook(book, pageNumber) {
  // Reset modal display and canvas

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
    <p>Description: ${book.description || 'No description available.'}</p>

    <div class="rating-section" style="display: ${
      book.averageRating === undefined ? 'none' : 'block'
    };">
      <p>Average Rating: <strong>${
        book.averageRating?.toFixed(1) || 'N/A'
      }</strong> (${book.ratingCount || 0} ratings)</p>

      <div class="rating-stars" data-book-id="${book._id}">
        ${[1, 2, 3, 4, 5]
          .map(star => `<span class="star" data-value="${star}">&#9733;</span>`)
          .join('')}
      </div>
    </div>
  `;

  if (book.bookType === 'physical') {
    document.getElementById('readNowBtn').style.display = 'none';
    document.getElementById('pdfModal').style.display = 'none';
  } else if (book.bookType === 'ebook') {
    document.getElementById('readNowBtn').style.display = 'block';
  }

  let pdfDoc = null;
  let pageNum = pageNumber;
  let pageRendering = false;
  let currentPage = null;
  const canvas = document.getElementById('pdfCanvas');
  const ctx = canvas.getContext('2d');

  // Render the specified page number only
  function renderPage(num) {
    if (pageRendering) return; // prevent multiple renders
    pageRendering = true;

    pdfDoc.getPage(num).then(page => {
      const viewport = page.getViewport({ scale: 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      page.render(renderContext).promise.then(() => {
        pageRendering = false;
        currentPage = num;
        document.getElementById('pageNum').textContent = num;
        saveLastPage();
      });
    });
  }

  function saveLastPage() {
    const ratingStars = document.querySelector('.rating-stars');
    const bookId = ratingStars?.getAttribute('data-book-id');
    if (!bookId || !currentPage) return;

    // Make sure 'token' variable is defined globally or replace with your auth token source
    fetch('/api/books/ebook/savePageNumber', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        bookId: bookId,
        pageNumber: currentPage,
      }),
    }).catch(err => {
      console.error('Failed to save last read page:', err);
    });
  }

  document.getElementById('readNowBtn').onclick = function () {
    bookInfo.style.display = 'none';
    const pdfUrl = book.ebookFileUrl;
    const modal = document.getElementById('pdfModal');
    modal.style.display = 'flex';
    const bookItems = document.querySelector('.book-item');
    bookItems.style.display = 'none';

    // Load the PDF document
    pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
      document.getElementById('pageCount').textContent = '';
      document.getElementById('pageNum').textContent = '';
      pdfDoc = pdf;
      document.getElementById('pageCount').textContent = pdf.numPages;

      // Get last saved page or start from the provided page number
      const lastPage = pageNum || 1;
      pageNum = lastPage;

      // Render only the current page
      renderPage(pageNum);
    });
  };

  // Navigation buttons render only the current page on click
  document.getElementById('prevPage').onclick = function () {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum, book.ebookFileUrl);
  };

  document.getElementById('nextPage').onclick = function () {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    renderPage(pageNum, book.ebookFileUrl);
  };

  document.getElementById('closePdfModal').onclick = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
    document.getElementById('pageCount').textContent = '';
    document.getElementById('pageNum').textContent = '';
    currentPage = null;
    document.getElementById('pdfModal').style.display = 'none';
    bookInfo.style.display = 'block';
    const listBook = document.getElementById('myBookList');
    listBook.style.display = 'flex';
    fetchBookRead();
  };

  // Star rating event listeners
  document.querySelectorAll('.rating-stars').forEach(container => {
    container.addEventListener('click', async e => {
      if (!e.target.classList.contains('star')) return;
      const value = Number(e.target.getAttribute('data-value'));
      const bookId = container.getAttribute('data-book-id');

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
      } catch {
        document.getElementById('rating-status').textContent = 'Rating failed.';
      }
    });
  });

  // Reset event listeners on add/remove buttons to prevent duplicates
  const newAddBtn = addToLibraryBtn.cloneNode(true);
  addToLibraryBtn.parentNode.replaceChild(newAddBtn, addToLibraryBtn);
  newAddBtn.addEventListener('click', () => addToLibrary(book));

  const newRemoveBtn = removeToLibrary.cloneNode(true);
  removeToLibrary.parentNode.replaceChild(newRemoveBtn, removeToLibrary);
  newRemoveBtn.addEventListener('click', () => removeToLibraryFunc(book));

  bookInfo.style.display = 'block';
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
        <p class="book-author">Author: ${book.authors || 'Unknown'}</p>
        <p class="book-description">Description: ${book.description}</p>
        <p style="display: ${
          book.averageRating === undefined ? 'none' : 'block'
        };">
          Average rating: <strong>${
            book.averageRating?.toFixed(1) || 'N/A'
          }</strong> 
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
  const removeToLibraryBtn = document.getElementById('removeToLibrary');

  bookDetails.innerHTML = `
    <img 
      class="book-details-image ${!book.coverImageUrl ? 'no-image' : ''}" 
      src="${book.coverImageUrl || ''}" 
      alt="${book.title}">

    <h3>${book.title}</h3>
    <p>Author(s): ${book.authors || 'Unknown'}</p>
    <p>Genre: ${
      Array.isArray(book.genre)
        ? book.genre.map(g => g.toUpperCase()).join(', ')
        : book.genre
    }</p>
    <p>Description: ${book.description || 'No description available.'}</p>

    <div class="rating-section" style="display: ${
      book.averageRating === undefined ? 'none' : 'block'
    };">
      <p>Average Rating: <strong>${
        book.averageRating?.toFixed(1) || 'N/A'
      }</strong> (${book.ratingCount || 0} ratings)</p>
      <div class="rating-stars" data-book-id="${book._id}">
        ${[1, 2, 3, 4, 5]
          .map(star => `<span class="star" data-value="${star}">&#9733;</span>`)
          .join('')}
      </div>
    </div>
  `;

  if (book.bookType === 'physical') {
    document.getElementById('readNowBtn').style.display = 'none';
    document.getElementById('pdfModal').style.display = 'none';
  } else if (book.bookType === 'ebook') {
    document.getElementById('readNowBtn').style.display = 'block';
  }

  let pdfDoc = null;
  let pageNum = 1;
  let pageRendering = false;
  const canvas = document.getElementById('pdfCanvas');
  const ctx = canvas.getContext('2d');

  function renderPage(num) {
    if (pageRendering) return;
    pageRendering = true;

    pdfDoc.getPage(num).then(page => {
      const viewport = page.getViewport({ scale: 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = { canvasContext: ctx, viewport };
      page.render(renderContext).promise.then(() => {
        pageRendering = false;
        document.getElementById('pageNum').textContent = num;
        saveLastPage(num);
      });
    });
  }

  function saveLastPage(num) {
    const ratingStars = document.querySelector('.rating-stars');
    const bookId = ratingStars?.getAttribute('data-book-id');
    const token = localStorage.getItem('jwt');
    if (!bookId || !token) return;

    fetch('/api/books/ebook/savePageNumber', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookId, pageNumber: num }),
    }).catch(err => {
      console.error('Failed to save last read page:', err);
    });
  }

  document.getElementById('readNowBtn').onclick = function () {
    bookInfo.style.display = 'none';
    const pdfUrl = book.ebookFileUrl;
    const modal = document.getElementById('pdfModal');
    modal.style.display = 'flex';

    document.querySelectorAll('.browse').forEach(item => {
      item.style.display = 'none';
    });
    document.querySelectorAll('.book-item').forEach(item => {
      item.style.display = 'none';
    });

    pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
      pdfDoc = pdf;
      document.getElementById('pageCount').textContent = pdf.numPages;
      pageNum = 1;
      renderPage(pageNum);
    });
  };

  document.getElementById('prevPage').onclick = () => {
    if (pageNum > 1) {
      pageNum--;
      renderPage(pageNum);
    }
  };

  document.getElementById('nextPage').onclick = () => {
    if (pdfDoc && pageNum < pdfDoc.numPages) {
      pageNum++;
      renderPage(pageNum);
    }
  };

  document.getElementById('closePdfModal').onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
    document.getElementById('pageCount').textContent = '';
    document.getElementById('pageNum').textContent = '';
    currentPage = null;
    document.getElementById('pdfModal').style.display = 'none';
    document.querySelector('.books').style.display = 'none';
    document.querySelector('.sidebar').style.display = 'none';
    document.querySelector('.browse').style.display = 'block';
    document.querySelector('.genre').style.display = 'block';
    fetchBrowseEbook();
    loadGenres();
  };

  const ratingContainer = document.querySelector('.rating-stars');
  if (ratingContainer) {
    ratingContainer.addEventListener('click', async e => {
      if (!e.target.classList.contains('star')) return;
      const value = Number(e.target.getAttribute('data-value'));
      const bookId = ratingContainer.getAttribute('data-book-id');

      ratingContainer.querySelectorAll('.star').forEach(star => {
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
  }

  const newAddBtn = addToLibraryBtn.cloneNode(true);
  addToLibraryBtn.replaceWith(newAddBtn);
  newAddBtn.addEventListener('click', () => addToLibrary(book));

  const newRemoveBtn = removeToLibraryBtn.cloneNode(true);
  removeToLibraryBtn.replaceWith(newRemoveBtn);
  newRemoveBtn.addEventListener('click', () => removeToLibraryFunc(book));

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

  // Determine which books to search based on the active section
  const isBrowseActive =
    document.querySelector('.browse').style.display === 'block';
  const booksToSearch = isBrowseActive ? ebooks.concat(physicalBooks) : myBooks;
  const container = isBrowseActive ? browseBookListEl : myBookListEl;

  // Filter books based on the input
  const filtered = booksToSearch.filter(book =>
    book.title.toLowerCase().includes(input)
  );

  // Display the filtered books
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

    // Add "ALL" option at the top
    const allLi = document.createElement('li');
    allLi.innerHTML = `<a href="#All">ALL</a>`;
    allLi.addEventListener('click', () => {
      // Highlight the selected genre
      setSelectedGenre(allLi);

      // Show all books
      displayBooks(ebooks.concat(physicalBooks), browseBookListEl);
    });
    genreList.appendChild(allLi);

    // Sort genres alphabetically by name
    const sortedGenres = (
      Array.isArray(genres) ? genres : Object.values(genres)
    )
      .filter(genre => genre?.name) // Ensure the genre has a name
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

    // Append sorted genres to the list
    sortedGenres.forEach(genre => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="#${genre.name}">${genre.name.toUpperCase()}</a>`;
      li.addEventListener('click', () => {
        // Highlight the selected genre
        setSelectedGenre(li);
        document.querySelector('.book-info').style.display = 'none';

        // Filter books by genre
        const filteredBooks = ebooks
          .concat(physicalBooks)
          .filter(book =>
            Array.isArray(book.genre)
              ? book.genre.includes(genre.name)
              : book.genre === genre.name
          );

        displayBooks(filteredBooks, browseBookListEl);
      });
      genreList.appendChild(li);
    });
  } catch (error) {
    console.error('Failed to load genres:', error);
  }
}

// Function to highlight the selected genre
function setSelectedGenre(selectedLi) {
  // Remove the 'selected' class from all list items
  document.querySelectorAll('#genreList li').forEach(li => {
    li.classList.remove('selected');
  });

  // Add the 'selected' class to the clicked list item
  selectedLi.classList.add('selected');
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

  document.querySelector('.book-info').style.display = 'none';
  document.querySelector('.browse').style.display = 'none';
  document.querySelector('.sidebar').style.display = 'block';
  document.querySelector('.genre').style.display = 'none';
  document.querySelector('.books').style.display = 'block';
  fetchBookRead();
});

document.getElementById('Browse').addEventListener('click', e => {
  e.preventDefault();
  document.querySelector('.book-info').style.display = 'none';
  document.querySelector('.books').style.display = 'none';
  document.querySelector('.sidebar').style.display = 'none';
  document.querySelector('.browse').style.display = 'block';
  document.querySelector('.genre').style.display = 'block';
  fetchBrowseEbook();
  loadGenres();
});

document.getElementById('ebookBtn').addEventListener('click', e => {
  e.preventDefault();
  document.querySelector('.book-info').style.display = 'none';
  document.querySelector('.books').style.display = 'none';
  document.querySelector('.sidebar').style.display = 'none';
  document.querySelector('.browse').style.display = 'block';
  document.querySelector('.genre').style.display = 'block';
  fetchBrowseEbook();
  loadGenres();
});

document.getElementById('physicalBtn').addEventListener('click', e => {
  e.preventDefault();
  document.querySelector('.book-info').style.display = 'none';
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

document.getElementById('currentBookBtn').addEventListener('click', e => {
  e.preventDefault();
  document.querySelector('.book-info').style.display = 'none';
  document.querySelector('.browse').style.display = 'none';
  document.querySelector('.sidebar').style.display = 'block';
  document.querySelector('.genre').style.display = 'none';
  document.querySelector('.books').style.display = 'block';
  fetchBookRead();
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  logoutUser();
});
