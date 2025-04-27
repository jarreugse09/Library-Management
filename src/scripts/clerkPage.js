document.addEventListener('DOMContentLoaded', () => {
  const sections = {
    Inventory: document.getElementById('Inventory'),
    donation: document.getElementById('donation'),
    borrow: document.getElementById('borrow'),
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

  // Helper to show only one main section
  function showSection(activeSection) {
    Object.keys(sections).forEach(key => {
      sections[key].style.display = key === activeSection ? 'block' : 'none';
    });
  }

  // Sidebar navigation
  links.inventory.addEventListener('click', () => showSection('Inventory'));
  links.encodeNew.addEventListener('click', () =>
    showSection('encodeBookSection')
  );
  links.donation.addEventListener('click', () => {
    showSection('donation');
    showDonationPending(); // Show donation pending by default
  });

  links.borrowed.addEventListener('click', () => {
    showSection('borrow');
    showBorrowPending(); // Show borrow pending by default
  });

  // Borrow toggle buttons
  pendingBtn.addEventListener('click', showBorrowPending);
  logsBtn.addEventListener('click', () => {
    pendingBorrow.style.display = 'none';
    borrowedLogs.style.display = 'block';
    // fetchBorrowLogs(); // optional future feature
  });

  // Donation toggle buttons
  donationPendingBtn.addEventListener('click', showDonationPending);
  donationLogsBtn.addEventListener('click', () => {
    donationPending.style.display = 'none';
    donationLogs.style.display = 'block';
    // fetchDonationLogs(); // optional future feature
  });

  function showDonationPending() {
    donationPending.style.display = 'block';
    donationLogs.style.display = 'none';
    fetchPendingDonations();
  }

  function showBorrowPending() {
    pendingBorrow.style.display = 'block';
    borrowedLogs.style.display = 'none';
    fetchPendingBorrows();
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
        li.innerHTML = `
          <strong>${donation.title}</strong><br>
          Donated by: ${donation.donorName}<br>
          Authors: ${donation.authors.join(', ')}<br>
          Book Type: ${donation.bookType}<br>
          Published Year: ${donation.publishedYear || 'N/A'}<br>
        `;

        // Create approve button and attach event listener
        const approveBtn = document.createElement('button');
        approveBtn.textContent = 'Approve';
        approveBtn.addEventListener('click', () =>
          handleAction(donation._id, 'approve')
        );

        // Create reject button and attach event listener
        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = 'Reject';
        rejectBtn.addEventListener('click', () =>
          handleAction(donation._id, 'reject')
        );

        // Append buttons to the list item
        li.appendChild(approveBtn);
        li.appendChild(rejectBtn);
        li.appendChild(document.createElement('hr'));

        // Append list item to the list
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
          body: JSON.stringify({
            role: 'clerk', // Ensure this key is included in the body
          }),
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

  // Optional: Load default view
  showSection('Inventory');
});

async function loadDonationLogs() {
  try {
    const response = await fetch('http://127.0.0.1:7001/api/donations/logs');
    if (!response.ok) throw new Error('Failed to fetch logs');

    const logs = await response.json();
    const logList = document.getElementById('donationLogList');
    logList.innerHTML = ''; // Clear previous logs

    const donationLogs = logs.filter(log => log.type === 'DONATION');

    if (donationLogs.length === 0) {
      logList.innerHTML = '<li>No donation logs found.</li>';
    } else {
      // Create a table for the donation logs
      const table = document.createElement('table');
      table.innerHTML = `
        <thead>
          <tr>
            <th>Date</th>
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
          <td>${log.role}</td>
          <td>${log.action}</td>
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
      borrowedBooks.forEach(book => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>TITLE: ${book.bookTitle}</strong> — Borrower: ${
          book.borrowerName
        } |
          Borrowed At: ${new Date(book.borrowDate).toLocaleDateString()} |
         Will Return: ${new Date(book.returnDate).toLocaleDateString()}
        `;
        borrowLog.appendChild(li);
      });
    }

    // Reveal the borrowed books section
    document.getElementById('borrow').style.display = 'block';
    document.getElementById('borrowedLogs').style.display = 'block';
  } catch (error) {
    console.error('Error fetching borrowed books:', error);
    alert('Failed to fetch borrowed books. Please try again.');
  }
}

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
          <td><button class="edit-btn">Edit</button></td>
        </tr>
      `;
      inventoryList.insertAdjacentHTML('beforeend', row);
    });
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
      shelfLocation: document.getElementById('updateLocation').value,
      status: document.getElementById('updateStatus').value,
    };

    const res = await fetch(`/api/books/physical/${currentBookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedBook),
    });

    const data = await res.json();
    console.log(data);
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

// NEW BOOK
// Handle clicks for all links
document.querySelectorAll('li a').forEach(link => {
  link.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent normal anchor behavior

    // Empty the #content div
    const contentDiv = document.getElementById('content');
    if (contentDiv) {
      contentDiv.innerHTML = '';
    }

    // Get which link was clicked
    const linkId = this.id;

    // Only open the Encode New Book modal if newBookLink was clicked
    if (linkId === 'newBookLink') {
      document.getElementById('encodeBookSection').style.display = 'block';
    } else {
      // Otherwise hide the modal if it was open
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

// Handle form submission
async function handleBookFormSubmit(event) {
  event.preventDefault();

  const formData = {
    title: document.getElementById('newTitle').value,
    authors: document.getElementById('newAuthor').value.split(','), // Handle multiple authors if needed
    publishedYear: document.getElementById('newYear').value,
    genre: document.getElementById('newGenre').value,
    type: document.getElementById('newType').value, // Mapped as 'bookType'
    quantity: document.getElementById('newQuantity').value,
    shelfLocation: document.getElementById('newLocation').value,
    condition: document.getElementById('newCondition').value,
    status: document.getElementById('newStatus').value,
    donorName: 'clerk',
  };

  console.log(formData);

  try {
    console.log(formData);
    const response = await fetch('/api/books/physical/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    console.log(response.json());
    if (data._id) {
      alert('Book successfully encoded!');
      console.log(data); // Logging the successful response
      document.getElementById('encodeBookSection').style.display = 'none'; // Hide modal
    } else {
      alert('Failed to encode book.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Attach the event listener to the form
document
  .getElementById('encodeBookForm')
  .addEventListener('submit', handleBookFormSubmit);
