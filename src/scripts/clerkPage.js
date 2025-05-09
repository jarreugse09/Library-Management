document.addEventListener('DOMContentLoaded', () => {
  const sections = {
    Inventory: document.getElementById('Inventory'),
    donation: document.getElementById('donation'),
    borrow: document.getElementById('borrow'),
    encodeBookSection: document.getElementById('encodeBookSection'), // Make sure this exists
  };

  const links = {
    inventory: document.getElementById('inventoryLink'),
    donation: document.getElementById('donationLink'),
    encodeNew: document.getElementById('newBookLink'),
    borrowed: document.getElementById('borrowedLink'),
  };

  const pendingBtn = document.getElementById('pendingBtn');
  const logsBtn = document.getElementById('logsBtn');
  const pendingBorrow = document.getElementById('pending-borrow');
  const borrowedLogs = document.getElementById('borrowedLogs');

  const donationPendingBtn = document.getElementById('donationPendingBtn');
  const donationLogsBtn = document.getElementById('donationLogsBtn');
  const donationPending = document.getElementById('donationPending');
  const donationLogs = document.getElementById('donationLogs');

  const donationList = document.getElementById('donationList');
  const borrowList = document.getElementById('borrowList');
  const borrowLogsBtn = document.getElementById('borrowedLogsBtn');

  function showSection(activeSection) {
    Object.keys(sections).forEach(key => {
      if (sections[key]) {
        sections[key].style.display = key === activeSection ? 'block' : 'none';
      }
    });
  }

  function showDonationPending() {
    if (donationPending && donationLogs) {
      donationPending.style.display = 'block';
      donationLogs.style.display = 'none';
      fetchPendingDonations();
    }
  }

  function showBorrowPending() {
    if (pendingBorrow && borrowedLogs) {
      pendingBorrow.style.display = 'block';
      borrowedLogs.style.display = 'none';
      fetchPendingBorrows();
    }
  }

  // Event bindings with null checks
  donationPendingBtn?.addEventListener('click', showDonationPending);
  donationLogsBtn?.addEventListener('click', () => {
    if (donationPending && donationLogs) {
      donationPending.style.display = 'none';
      donationLogs.style.display = 'block';
      loadDonationLogs();
    }
  });

  pendingBtn?.addEventListener('click', showBorrowPending);
  borrowLogsBtn?.addEventListener('click', () => {
    pendingBorrow.style.display = 'none';
    borrowedLogs.style.display = 'block';
    fetchBorrowedBooks();
  });

  pendingBtn?.addEventListener('click', showBorrowPending);
  logsBtn?.addEventListener('click', () => {
    pendingBorrow.style.display = 'none';
    borrowedLogs.style.display = 'block';
    fetchBorrowedBooks();
  });

  links.inventory?.addEventListener('click', () => showSection('Inventory'));
  links.encodeNew?.addEventListener('click', () =>
    showSection('encodeBookSection')
  );
  links.donation?.addEventListener('click', () => {
    showSection('donation');
    showDonationPending();
  });
  links.borrowed?.addEventListener('click', () => {
    showSection('borrow');
    showBorrowPending();
  });

  async function loadGenres() {
    const res = await fetch('/api/books/genre/'); // Replace with your actual route
    const genres = await res.json(); // Assume it returns an array like ['Fiction', 'Mystery', ...]

    const container = document.getElementById('genre-checkboxes');
    container.innerHTML = ''; // Clear existing content

    genres.forEach(genre => {
      const label = document.createElement('label');
      label.innerHTML = `
      <input type="checkbox" name="genre[]" value="${
        genre.name
      }"> ${genre.name.toUpperCase()}
    `;
      container.appendChild(label);
    });

    // Add the "Other" option
    const otherLabel = document.createElement('label');
    otherLabel.innerHTML = `
    <input type="checkbox" id="genre-other"> Other
  `;
    container.appendChild(otherLabel);

    // Add toggle logic for "Other"
    const otherCheckbox = otherLabel.querySelector('#genre-other');
    const otherInput = document.getElementById('other-genre-input');

    otherCheckbox.addEventListener('change', () => {
      otherInput.style.display = otherCheckbox.checked ? 'block' : 'none';
      if (!otherCheckbox.checked) otherInput.value = '';
    });
  }

  loadGenres();

  async function loadDonationLogs() {
    try {
      const response = await fetch('http://127.0.0.1:7001/api/donations/logs');
      if (!response.ok) throw new Error('Failed to fetch logs');

      const logs = await response.json();
      const logList = document.getElementById('donationLogList');
      logList.innerHTML = ''; // Clear previous logs
      const allowedTypes = ['DONATION', 'ENCODED BY CLERK'];
      const donationLogs = logs.filter(log => allowedTypes.includes(log.type));

      if (donationLogs.length === 0) {
        logList.innerHTML = '<li>No donation logs found.</li>';
      } else {
        // Create a table for the donation logs
        const table = document.createElement('table');
        table.innerHTML = `
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>User</th>
              <th>Action</th>
              <th>Donated Book ID</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        `;

        // Append the table to the log list container
        logList.appendChild(table);

        // Populate the table with log data
        const tbody = table.querySelector('tbody');
        donationLogs.forEach(log => {
          const date = new Date(log.timestamp).toLocaleString();
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${date}</td>
            <td>${log.type}</td>
            <td>${log.role.toUpperCase()}</td>
            <td>${
              log.action === 'approve and encode'
                ? 'ENCODE'
                : log.action.toUpperCase()
            }</td>
            <td>${log.refId}</td>
          `;
          tbody.appendChild(row);
        });
      }

      document.getElementById('donationLogs').style.display = 'block';
    } catch (error) {
      console.error('Error fetching donation logs:', error);
    }
  }

  async function fetchPendingDonations() {
    try {
      const response = await fetch(
        'http://localhost:7001/api/donations/pending/'
      );
      if (!response.ok) throw new Error('Failed to fetch');

      const donations = await response.json();
      const list = document.getElementById('donationList');
      list.innerHTML = ''; // Clear the list before rendering new items

      if (donations.length === 0) {
        const head = document.createElement('h2');
        head.innerHTML = `No Pending Donation Request.`;
        list.appendChild(head); // ← This is what was missing
        return; // Optional: prevent further code from running
      }

      donations.forEach(donation => {
        const li = document.createElement('li');

        // Create a table for the donation data
        const table = document.createElement('table');
        table.innerHTML = `
          <thead>
            <tr>
              <th>Title</th>
              <th>Donated By</th>
              <th>Authors</th>
              <th>Book Type</th>
              <th>Published Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${donation.title}</td>
              <td>${donation.donorName}</td>
              <td>${donation.authors.join(', ')}</td>
              <td>${donation.bookType}</td>
              <td>${donation.publishedYear || 'N/A'}</td>
              <td>
                <div class="button-container">
                  <button class="approve-btn">Approve</button>
                  <button class="reject-btn">Reject</button>
                </div>
              </td>
            </tr>
          </tbody>
        `;

        // Add event listeners to the buttons
        const approveBtn = table.querySelector('.approve-btn');
        approveBtn.addEventListener('click', () =>
          handleAction(donation._id, 'approve')
        );

        const rejectBtn = table.querySelector('.reject-btn');
        rejectBtn.addEventListener('click', () =>
          handleAction(donation._id, 'reject')
        );

        // Append the table to the list item
        li.appendChild(table);
        li.appendChild(document.createElement('hr'));

        // Append the list item to the list
        list.appendChild(li);
      });
    } catch (err) {
      console.error('Error fetching donations:', err);
    }
  }

  async function handleAction(donationId, action) {
    try {
      const response = await fetch(
        `http://127.0.0.1:7001/api/donations/${donationId}/${action}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: 'clerk' }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        fetchPendingDonations(); // reload list
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      console.error(`Error trying to ${action} donation:`, err);
    }
  }

  async function fetchPendingBorrows() {
    try {
      const response = await fetch(
        'http://127.0.0.1:7001/api/borrows/pending/'
      );
      if (!response.ok) throw new Error('Failed to fetch borrows');

      const data = await response.json();

      // Ensure the data is an array
      if (!Array.isArray(data)) {
        throw new Error('Expected data to be an array');
      }

      borrowList.innerHTML = ''; // Clear any previous data

      // Check if there are no pending borrow requests
      if (data.length === 0) {
        borrowList.innerHTML = '<li>No pending borrow requests found.</li>';
        return;
      }

      data.forEach(borrow => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
          <strong>Book ID: ${borrow.borrowedBookId}</strong><br>
           <strong>Book Title: ${borrow.bookTitle}</strong><br>
          Borrowed by: ${borrow.borrowerName}<br>
          Contact Info: ${borrow.contactInfo}<br>
          Borrow Date: ${new Date(borrow.borrowDate).toLocaleDateString()}<br>
          Expected Return Date: ${new Date(
            borrow.returnDate
          ).toLocaleDateString()}<br><br>
      
        `;
        // Create approve button and attach event listener
        const approveBtn = document.createElement('button');
        approveBtn.textContent = 'Approve';
        approveBtn.addEventListener('click', () =>
          handleActionBorrow(borrow._id, 'approve')
        );

        // Create reject button and attach event listener
        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = 'Reject';
        rejectBtn.addEventListener('click', () =>
          handleActionBorrow(borrow._id, 'reject')
        );

        // Append buttons to the list item
        listItem.appendChild(approveBtn);
        listItem.appendChild(rejectBtn);
        listItem.appendChild(document.createElement('hr'));

        borrowList.appendChild(listItem);
      });
    } catch (err) {
      console.error('Error loading borrows:', err);
      borrowList.innerHTML = '<li>Error loading borrow requests.</li>';
    }
  }

  async function handleActionBorrow(_id, action) {
    try {
      const response = await fetch(
        `http://127.0.0.1:7001/api/borrows/${_id}/${action}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'clerk', // Ensure this key is included in the body
          }),
        }
      );
      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        fetchPendingBorrows(); // reload list
      }
    } catch (err) {
      console.error(`Error trying to ${action} borrow:`, err);
    }
  }

  async function fetchBorrowedBooks() {
    try {
      const response = await fetch('http://127.0.0.1:7001/api/borrows/logs');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const borrowedBooks = await response.json();
      const borrowLog = document.getElementById('borrowLog');

      // Clear previous logs
      borrowLog.innerHTML = '';

      // Check if there's data
      if (!borrowedBooks.length) {
        borrowLog.innerHTML = '<li>No borrowed books found.</li>';
      } else {
        // Create a table for the borrowed books
        const table = document.createElement('table');
        table.innerHTML = `
          <thead>
            <tr>
              <th>Title</th>
              <th>Borrower</th>
              <th>Borrowed At</th>
              <th>Will Return</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        `;

        // Append the table to the borrow log container
        borrowLog.appendChild(table);

        // Populate the table with borrowed book data
        const tbody = table.querySelector('tbody');
        borrowedBooks.forEach(book => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${book.bookTitle}</td>
            <td>${book.borrowerName}</td>
            <td>${new Date(book.borrowDate).toLocaleDateString()}</td>
            <td>${new Date(book.returnDate).toLocaleDateString()}</td>
            <td>${book.role.toUpperCase()}</td>
          `;
          tbody.appendChild(row);
        });
      }
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
      alert('Failed to fetch borrowed books. Please try again.');
    }
  }

  // Optional: Load default view
  showSection('Inventory');
});

// INVENTORY
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const inventoryList = document.getElementById('inventoryList');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');
  const tableHeaders = document.querySelectorAll('th.sortable');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const inventoryLink = document.querySelector('.inventoryLink');

  const updateBookModal = document.getElementById('updateBookModal');
  const closeUpdateModalBtn = document.getElementById('closeUpdateModal');
  const updateBookForm = document.getElementById('updateBookForm');

  let currentPage = 1;
  let totalPages = 1;
  const limit = 10;
  let currentSortField = 'title';
  let currentSortOrder = 'asc';
  let currentBookId = null;

  function showLoader() {
    console.log('Loading...');
  }

  function hideLoader() {
    console.log('Data Loaded');
  }

  async function fetchBooks() {
    const search = searchInput.value.trim();
    const status = document.getElementById('statusFilter').value;
    const location = document.getElementById('locationFilter').value;

    const params = new URLSearchParams({
      search,
      page: currentPage,
      limit,
      sort: currentSortField,
      order: currentSortOrder,
      status,
      // don't send location in params if backend doesn't support it
    });

    showLoader(); // Show loader before fetching

    const res = await fetch(`/api/books/physical?${params.toString()}`);
    const data = await res.json();

    let books = data.books;

    // Filter by location manually if needed
    if (location) {
      books = books.filter(book => {
        const bookLocation =
          book.shelfLocation == null ? 'Not Set' : book.shelfLocation;
        return bookLocation === location;
      });
    }

    renderBooks(books);
    populateLocationFilter(data.books); // Always from full unfiltered list
    totalPages = data.totalPages;
    updatePaginationControls();
    hideLoader(); // Hide loader after fetching
  }

  function populateLocationFilter(books) {
    const locationFilter = document.getElementById('locationFilter');

    // Get unique locations
    const uniqueLocations = [
      ...new Set(
        books
          .map(book =>
            book.shelfLocation == null ? 'Not Set' : book.shelfLocation
          )
          .filter(location => location !== null && location !== '')
      ),
    ];

    // Clear old options except the first ("All Locations")
    locationFilter.innerHTML = '<option value="">All Locations</option>';

    // Add new options
    uniqueLocations.forEach(location => {
      const option = document.createElement('option');
      option.value = location;
      option.textContent = location;
      locationFilter.appendChild(option);
    });
  }

  document.getElementById('locationFilter').addEventListener('change', () => {
    currentPage = 1; // Reset to first page when filter changes
    fetchBooks(); // Re-fetch books with new location
  });

  function renderBooks(books) {
    inventoryList.innerHTML = '';

    if (books.length === 0) {
      inventoryList.innerHTML =
        '<tr><td colspan="10" style="text-align:center;">No books found</td></tr>';
      return;
    }

    books.forEach(book => {
      const row = `
        <tr data-id="${book._id}">
          <td>${book.title}</td>
          <td>${book.authors.join(', ')}</td>
          <td>${book.publishedYear}</td>
          <td>${book.genre}</td>
          <td>${book.quantity}</td>
          <td>${book.bookType}</td>
          <td>${book.condition}</td>
          <td>${
            book.shelfLocation == null ? 'Not Set' : book.shelfLocation
          }</td>
          <td>${book.status === 'good' ? 'available' : book.status}</td>
           <td><button class="edit-btn">Edit</button>
          <button class="deleteBtn">Tag Delete</button>
        </tr>
      `;
      inventoryList.insertAdjacentHTML('beforeend', row);
    });
  }

  //SOFT DELETE BUTTON
  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('deleteBtn')) {
      const row = event.target.closest('tr');
      const bookId = row.getAttribute('data-id');

      if (confirm('Are you sure you want to delete this book?')) {
        deleteBook(bookId, row);
      }
    }
  });

  async function deleteBook(bookId, row) {
    try {
      const response = await fetch(
        `http://127.0.0.1:7001/api/books/physical/${bookId}/delete`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        row.remove(); // Remove row from the table if the request is successful
        alert('Book deleted successfully.');
      } else {
        alert('Failed to delete the book.');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('An error occurred while deleting the book.');
    }
  }

  function updatePaginationControls() {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
  }

  function handleSort(field) {
    if (currentSortField === field) {
      currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      currentSortField = field;
      currentSortOrder = 'asc';
    }
    currentPage = 1;
    fetchBooks();
  }

  function resetFilters() {
    searchInput.value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('locationFilter').value = '';
    currentPage = 1;
    fetchBooks();
  }

  function openUpdateModal(book) {
    console.log('Opening modal for book:', book);
    document.getElementById('updateTitle').value = book.title;
    document.getElementById('updateAuthor').value = book.authors.join(', ');
    document.getElementById('updateYear').value = book.publishedYear;
    document.getElementById('updateCategory').value = book.genre;
    document.getElementById('updateQuantity').value = book.quantity;
    document.getElementById('updateType').value = book.bookType;
    document.getElementById('updateCondition').value = book.condition;
    document.getElementById('updateLocation').value = book.shelfLocation;
    document.getElementById('updateStatus').value = book.status;
    currentBookId = book._id;

    updateBookModal.style.display = 'block';
  }

  // Event Listeners
  searchBtn.addEventListener('click', () => {
    currentPage = 1;
    fetchBooks();
  });

  searchInput.addEventListener('input', () => {
    currentPage = 1;
    fetchBooks();
  });

  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchBooks();
    }
  });

  nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchBooks();
    }
  });

  tableHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const field = header.getAttribute('data-sort');
      handleSort(field);
    });
  });

  resetFiltersBtn.addEventListener('click', () => {
    resetFilters();
  });

  if (inventoryLink) {
    inventoryLink.addEventListener('click', e => {
      e.preventDefault();
      fetchBooks();
    });
  }

  closeUpdateModalBtn.addEventListener('click', () => {
    updateBookModal.style.display = 'none';
  });

  updateBookForm.addEventListener('submit', async e => {
    e.preventDefault();

    const authors = document
      .getElementById('updateAuthor')
      .value.split(', ')
      .map(author => author.trim());

    const updatedBook = {
      title: document.getElementById('updateTitle').value,
      authors,
      publishedYear: document.getElementById('updateYear').value,
      genre: document.getElementById('updateCategory').value,
      quantity: document.getElementById('updateQuantity').value,
      bookType: document.getElementById('updateType').value,
      condition: document.getElementById('updateCondition').value,
      shelfLocation: bookdocument.getElementById('updateLocation').value,
      status: document.getElementById('updateStatus').value,
    };

    const res = await fetch(`/api/books/physical/${currentBookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedBook),
    });

    const data = await res.json();
    if (res.ok) {
      alert('Book updated successfully');
      updateBookModal.style.display = 'none';
      await fetchBooks();
    } else {
      alert('Failed to update the book');
    }
  });

  inventoryList.addEventListener('click', e => {
    if (e.target && e.target.classList.contains('edit-btn')) {
      const row = e.target.closest('tr');
      const book = {
        _id: row.getAttribute('data-id'),
        title: row.cells[0].textContent,
        authors: row.cells[1].textContent
          .split(', ')
          .map(author => author.trim()),
        publishedYear: row.cells[2].textContent,
        genre: row.cells[3].textContent,
        quantity: row.cells[4].textContent,
        bookType: row.cells[5].textContent,
        condition: row.cells[6].textContent,
        shelfLocation:
          row.cells[7].textContent === 'Not Set'
            ? null
            : row.cells[7].textContent,
        status: row.cells[8].textContent,
      };
      openUpdateModal(book);
    }
  });

  // Initial load
  fetchBooks();
});

//NEW BOOK
// Handle clicks for all links (new book, etc.)
document.querySelectorAll('li a').forEach(link => {
  link.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent normal anchor behavior

    const contentDiv = document.getElementById('content');
    if (contentDiv) {
      contentDiv.innerHTML = '';
    }

    const linkId = this.id;

    if (linkId === 'newBookLink') {
      document.getElementById('encodeBookSection').style.display = 'block';
    } else {
      document.getElementById('encodeBookSection').style.display = 'none';
    }
  });
});

// Close the Encode Modal (Cancel button)
document
  .getElementById('cancelNewBookBtn')
  .addEventListener('click', function () {
    document.getElementById('encodeBookSection').style.display = 'none';
  });

// Function to handle form submission
async function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  const checkedGenres = Array.from(
    document.querySelectorAll('input[name="genre[]"]:checked')
  ).map(input => input.value);

  // Include 'Other' genre input if visible
  const otherInput = document.getElementById('other-genre-input');
  if (
    otherInput &&
    otherInput.style.display !== 'none' &&
    otherInput.value.trim()
  ) {
    checkedGenres.push(otherInput.value.trim());
  }

  // Clear old genre entries, append updated ones
  formData.delete('genre[]');
  checkedGenres.forEach(genre => formData.append('genre[]', genre));

  // Optional: Disable submit button
  const submitButton = event.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.innerText = 'Submitting...';

  try {
    const response = await fetch(
      'http://127.0.0.1:7001/api/donations/donate/',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error submitting donation');
    }

    const data = await response.json();
    alert('Donation submitted successfully!');
    event.target.reset();

    // Reset authors input
    const authorsContainer = document.getElementById('authors-container');
    authorsContainer.innerHTML = `
      <label>Author(s)</label>
      <div>
        <input type="text" name="authors[]" required />
        <button type="button" class="btn btn-remove" onclick="removeAuthor(this)">Remove</button>
      </div>
    `;
  } catch (error) {
    console.error('Error submitting donation:', error);
    alert('An error occurred: ' + error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.innerText = 'Donate';
  }
}

// Function to add a new author input field
function addAuthor() {
  const authorsContainer = document.getElementById('authors-container');
  const newAuthorDiv = document.createElement('div');
  newAuthorDiv.innerHTML = `
    <input type="text" name="authors[]" required />
    <button type="button" class="btn btn-remove" onclick="removeAuthor(this)">Remove</button>
  `;
  authorsContainer.appendChild(newAuthorDiv);
}

// Function to remove an author input field
function removeAuthor(button) {
  const authorsContainer = document.getElementById('authors-container');
  authorsContainer.removeChild(button.parentElement);
}

// Function to toggle the visibility of conditional fields based on the selected book type
function toggleFields() {
  const physicalRadio = document.querySelector(
    'input[name="bookType"][value="physical"]'
  );
  const ebookRadio = document.querySelector(
    'input[name="bookType"][value="ebook"]'
  );
  const copyRadio = document.querySelector(
    'input[name="bookType"][value="copy"]'
  );

  const quantityField = document.getElementById('quantityField');
  const ebookFileInput = document.getElementById('ebookFileInput');
  const coverPageInput = document.getElementById('coverPageInput'); // NEW: Cover page input
  const shelfInput = document.getElementById('shelfLocation');
  const shelf = document.getElementById('shelf');

  if (physicalRadio.checked) {
    quantityField.style.display = 'block';
    ebookFileInput.style.display = 'none';
    coverPageInput.style.display = 'none';
    shelf.style.display = 'block';
    shelfInput.style.display = 'block';
  } else if (ebookRadio.checked) {
    quantityField.style.display = 'none';
    ebookFileInput.style.display = 'block';
    coverPageInput.style.display = 'block'; // Show cover page input for ebook
    shelf.style.display = 'none';
    shelfInput.style.display = 'none';
  } else if (copyRadio.checked) {
    quantityField.style.display = 'none';
    ebookFileInput.style.display = 'none';
    coverPageInput.style.display = 'none';
    shelf.style.display = 'block';
    shelfInput.style.display = 'block';
  }
}
