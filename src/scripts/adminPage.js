document.addEventListener('DOMContentLoaded', () => {
  const sections = {
    Inventory: document.getElementById('Inventory'),
    donation: document.getElementById('donation'),
    ebook: document.getElementById('ebookInventory'),
    borrow: document.getElementById('borrow'),
  };

  const links = {
    inventory: document.getElementById('inventoryLink'),
    ebook: document.getElementById('eBookLink'),
    donation: document.getElementById('donationLink'),
    borrowed: document.getElementById('borrowedLink'),
  };

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
  links.donation.addEventListener('click', () => {
    showSection('donation');
    showDonationPending(); // Show donation pending by default
  });

  links.borrowed.addEventListener('click', () => {
    showSection('borrow');
  });

  links.ebook.addEventListener('click', () => {
    showSection('ebookInventory');
  });

  // Borrow toggle buttons

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

  async function fetchPendingDonations() {
    try {
      const response = await fetch(
        'http://localhost:7001/api/donations/approve/'
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
          handleAction(donation._id, 'done')
        );

        // Create reject button and attach event listener
        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = 'Reject';
        rejectBtn.addEventListener('click', () =>
          handleAction(donation._id, 'rejected')
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
        `http://localhost:7001/api/donations/${donationId}/${action}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'librarian', // Ensure this key is included in the body
          }),
        }
      );

      const result = await response.json();
      console.log('result::', result);
      if (response.ok || response.status === 200) {
        alert(result.message);
        fetchPendingDonations(); // reload list
      } else {
        // Only display result.error if it exists
        const errorMessage = result.error
          ? result.error
          : 'No additional error info available';
        alert(`Error: ${result}, ${errorMessage}`);
        console.log(`Error: ${result}, ${errorMessage}`);
      }
    } catch (err) {
      console.error(`Error trying to ${action} donation:`, err);
    }
  }
});

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
      donationLogs.forEach(log => {
        const listItem = document.createElement('li');
        const date = new Date(log.timestamp).toLocaleString();

        listItem.textContent = `DATE: [${date}] TYPE: ${
          log.type
        } USER: ${log.role.toUpperCase()} ACTION: ${
          log.action === 'approve and encode'
            ? 'ENCODE'
            : log.action.toUpperCase()
        }
        
        ${
          log.action === 'approve and encode'
            ? 'ENCODED BY CLERK '
            : 'DONATED BOOK '
        }ID: ${log.refId}`;

        logList.appendChild(listItem);
      });
    }

    document.getElementById('donationLogs').style.display = 'block';
  } catch (error) {
    console.error('Error fetching donation logs:', error);
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
  const editEbookBtn = document.getElementById('ebook-edit-btn');

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

    const res = await fetch(`/api/books/physical/admin?${params.toString()}`);
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
          <td>${book.bookType.toUpperCase()}</td>
          <td>${book.condition.toUpperCase()}</td>
          <td>${
            book.shelfLocation == null
              ? 'NOT SET'
              : book.shelfLocation.toUpperCase()
          }</td>
          <td>${
            book.status === 'good' ? 'AVAILABLE' : book.status.toUpperCase()
          }</td>
          <td><button id="ebook-edit-btn">Edit</button>
          <button class="deleteBtn">Tag Delete</button>
          <button class="finalDeleteBtn">Delete</button></td>
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

  //PERMANENT DELETE
  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('finalDeleteBtn')) {
      const row = event.target.closest('tr');
      const bookId = row.getAttribute('data-id');

      if (confirm('Are you sure you want to delete this book?')) {
        permanentDeleteBook(bookId, row);
      }
    }
  });

  async function permanentDeleteBook(bookId, row) {
    try {
      const response = await fetch(
        `http://127.0.0.1:7001/api/books/physical/${bookId}/admin`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(response);
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

  editEbookBtn.addEventListener('click', () => {
    updateBookModal.style.display = 'block';
    openUpdateModal();
  });

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

//EBOOK INVENTORY
document.addEventListener('DOMContentLoaded', () => {
  const ebookSearchInput = document.getElementById('ebookSearchInput');
  const ebookSearchBtn = document.getElementById('ebookSearchBtn');
  const ebookResetBtn = document.getElementById('ebookResetBtn');
  const ebookList = document.getElementById('ebookList');
  const ebookPrevPageBtn = document.getElementById('ebookPrevPage');
  const ebookNextPageBtn = document.getElementById('ebookNextPage');
  const ebookPageInfo = document.getElementById('ebookPageInfo');

  const ebookUpdateModal = document.getElementById('ebookUpdateModal');
  const ebookUpdateForm = document.getElementById('ebookUpdateForm');
  const ebookCloseModal = document.getElementById('ebookCloseModal');

  // Add reference to ebookInventory div
  const ebookInventoryDiv = document.getElementById('ebookInventory');
  ebookInventoryDiv.style.display = 'none'; // Start with the div hidden

  let currentPage = 1;
  let totalPages = 1;

  // Initially hide the modal
  ebookUpdateModal.style.display = 'none';
  ebookUpdateForm.style.display = 'none';

  // Fetch ebook data from API
  async function fetchEbooks(page = 1) {
    try {
      const search = ebookSearchInput.value;
      const url = `/api/books/ebook?search=${search}&page=${page}&limit=10`; // Modify limit as needed
      const response = await fetch(url);
      const data = await response.json();

      totalPages = data.totalPages;
      currentPage = data.page;
      ebookPageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

      renderEbooks(data.books);
    } catch (error) {
      console.error('Error fetching ebooks:', error);
    }
  }

  // Render ebooks in the table
  function renderEbooks(ebooks) {
    ebookList.innerHTML = '';
    ebooks.forEach(ebook => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="${
          ebook.coverImageUrl
        }" alt="Book Cover" width="50" height="75" /></td>
        <td>${ebook.title}</td>
        <td>${ebook.authors.join(', ')}</td>
        <td>${ebook.publishedYear}</td>
        <td>${ebook.genre}</td>
        <td><a href="${
          ebook.ebookFileUrl
        }" target="_blank" class="ebook-link">View PDF</a></td>
        <td>
          <button class="edit-btn" data-id="${ebook._id}">Edit</button>
          <button onclick="deleteEbookTag(${ebook._id})">Delete Tag</button>
          <button onclick="deleteEbook(${ebook._id})">Delete</button>
        </td>
      `;
      ebookList.appendChild(tr);
    });

    // Rebind the edit button event listeners for each book
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', e => {
        const ebookId = e.target.getAttribute('data-id');
        openEditEbook(ebookId); // Open the edit modal when clicked
      });
    });

    const ebookLinks = document.querySelectorAll('.ebook-link');
    ebookLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault(); // Prevent default behavior (link navigation)
        const pdfUrl = link.getAttribute('href'); // Get the ebook's file URL
        displayPdf(pdfUrl); // Call the function to display the PDF
      });
    });
  }

  // Function to display the PDF in the iframe
  function displayPdf(pdfUrl) {
    const pdfViewer = document.getElementById('pdfViewer');
    const iframe = document.getElementById('pdfIframe');

    iframe.src = pdfUrl; // Set the PDF URL in the iframe
    pdfViewer.style.display = 'block'; // Show the PDF viewer

    // Handle close button click
    const closePdfButton = document.getElementById('closePdfViewer');
    closePdfButton.addEventListener('click', () => {
      pdfViewer.style.display = 'none'; // Hide the PDF viewer
      iframe.src = ''; // Reset the iframe source to stop the PDF from loading
    });
  }

  // Toggle ebookInventory div visibility
  function toggleEbookInventory(inventoryDiv) {
    if (inventoryDiv.style.display === 'none') {
      inventoryDiv.style.display = 'block'; // Show the div
    } else {
      inventoryDiv.style.display = 'none'; // Hide the div
    }
  }

  // Handle search button click
  ebookSearchBtn.addEventListener('click', () => {
    fetchEbooks(1); // Reset to first page when searching
  });

  // Handle reset button click
  ebookResetBtn.addEventListener('click', () => {
    ebookSearchInput.value = '';
    fetchEbooks(1); // Reset to first page when resetting
  });

  // Handle pagination (Previous and Next buttons)
  ebookPrevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      fetchEbooks(currentPage - 1);
    }
  });

  ebookNextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      fetchEbooks(currentPage + 1);
    }
  });

  // Function to open and populate the edit modal
  function openEditEbook(ebookId) {
    // Just store the ebookId somewhere (for use when submitting later)
    ebookUpdateForm.dataset.ebookId = ebookId;

    // Show the modal and form
    ebookUpdateModal.style.display = 'block';
    ebookUpdateForm.style.display = 'block';
  }

  // Handle ebook update form submission
  ebookUpdateForm.addEventListener('submit', async e => {
    e.preventDefault();

    const ebookId = ebookUpdateForm.dataset.ebookId; // get the stored id
    const formData = new FormData(ebookUpdateForm);

    try {
      await fetch(`/api/books/ebook/${ebookId}`, {
        method: 'PATCH',
        body: formData,
      });

      alert('Ebook updated successfully!');
      ebookUpdateModal.style.display = 'none';
      fetchEbooks(); // reload ebook list
    } catch (error) {
      console.error('Failed to update ebook:', error);
    }
  });

  // Close modal
  ebookCloseModal.addEventListener('click', () => {
    ebookUpdateModal.style.display = 'none'; // Hide the modal when close is clicked
  });

  // Handle eBookLink button click to show ebookInventory div
  const eBookLinkBtn = document.getElementById('eBookLink');
  eBookLinkBtn.addEventListener('click', () => {
    toggleEbookInventory(ebookInventoryDiv); // Show the ebook inventory div
  });

  // Fetch initial ebooks on page load
  fetchEbooks();
});
