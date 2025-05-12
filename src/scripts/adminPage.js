document.addEventListener('DOMContentLoaded', () => {
  // Section references
  const sections = {
    Inventory: document.getElementById('Inventory'),
    donation: document.getElementById('donation'),
    ebook: document.getElementById('ebookInventory'),
    borrow: document.getElementById('borrow'),
    manageMember: document.getElementById('manageMember'),
  };

  // Link references
  const links = {
    inventory: document.getElementById('inventoryLink'),
    ebook: document.getElementById('eBookLink'),
    donation: document.getElementById('donationLink'),
    borrowed: document.getElementById('borrowedLink'),
    manageMem: document.getElementById('manageMemberLink'),
  };

  // eBook related elements for searching, pagination, and modals
  const ebookInventoryDiv = document.getElementById('ebookInventory');
  const ebookUpdateModal = document.getElementById('ebookUpdateModal');

  // Handle link clicks to show corresponding sections
  links.inventory.addEventListener('click', () => {
    showSection('Inventory');
    fetchBooks(); // Fetch books when the Inventory section is shown
  });

  links.donation.addEventListener('click', () => {
    showSection('donation');
    showDonationPending(); // Show pending donations when the Donation section is shown
  });

  links.manageMem.addEventListener('click', () => {
    showSection('manageMember');
    showUsers();
  });

  donationPendingBtn.addEventListener('click', showDonationPending);
  donationLogsBtn.addEventListener('click', () => {
    donationPending.style.display = 'none';
    donationLogs.style.display = 'block';
    loadDonationLogs();
  });

  links.borrowed.addEventListener('click', () => {
    fetchBorrowedBooks();
    showSection('borrow');
  });

  links.ebook.addEventListener('click', () => {
    fetchEbooks();
    showSection('ebook');
  });

  // Close the ebook update modal
  const ebookCloseModal = document.getElementById('ebookCloseModal');

  ebookCloseModal.addEventListener('click', () => {
    ebookUpdateModal.style.display = 'none'; // Hide the modal when close is clicked
  });

  const memberModalBtn = document.getElementById('memberClose');
  const memberUpdateModal = document.getElementById('formMember');

  memberModalBtn.addEventListener('click', () => {
    memberUpdateModal.style.display = 'none';
    showSection('manageMember');
    showUsers();
  });

  // Function to show the correct section
  function showSection(sectionName) {
    Object.keys(sections).forEach(section => {
      if (section === sectionName) {
        sections[section].style.display = 'block'; // Show selected section
      } else {
        sections[section].style.display = 'none'; // Hide all other sections
      }
    });
  }

  function showUsers() {
    fetchUsers();
  }

  // Function to show donation pending list
  function showDonationPending() {
    donationPending.style.display = 'block';
    donationLogs.style.display = 'none';
    fetchPendingDonations();
  }

  async function fetchUsers() {
    try {
      const response = await fetch('/api/users/');

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      console.log('users: ', data);
      renderTable(data.users); // Access the `users` array from the response
    } catch (error) {
      console.error('Error fetching users:', error);
      const memberListTable = document.getElementById('memberListTable');
      memberListTable.innerHTML = '<p>Error loading users.</p>';
    }
  }
  function renderTable(users) {
    const table = document.createElement('table');
    table.classList.add('user-table');

    table.innerHTML = `
    <thead>
      <tr>
        <th>Name</th>
        <th>Role</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      ${users
        .map(
          user => `
        <tr data-id="${user._id}">
          <td>${user.username ?? 'N/A'}</td>
          <td>${user.role}</td>
          <td>${user.status}</td>
          <td>
            <button class="update-btn">Update</button>
            <button class="delete-btn">Delete</button>
          </td>
        </tr>
      `
        )
        .join('')}
    </tbody>`;

    const memberListTable = document.getElementById('memberListTable');
    memberListTable.innerHTML = '';
    memberListTable.appendChild(table);

    // Attach event listeners
    table
      .querySelectorAll('.update-btn')
      .forEach(button => button.addEventListener('click', handleUpdateClick));
    table
      .querySelectorAll('.delete-btn')
      .forEach(button => button.addEventListener('click', handleDeleteClick));
  }

  function handleUpdateClick(e) {
    const memberList = document.getElementById('memberListTable');
    memberList.style.display = 'none';
    memberUpdateModal.style.display = 'block';

    const row = e.target.closest('tr');
    const userId = row.getAttribute('data-id');
    const name = row.children[0].textContent;
    const role = row.children[1].textContent;
    const status = row.children[2].textContent;

    const form = document.getElementById('memberForm');
    form.setAttribute('data-id', userId);
    document.getElementById('updateMemName').value = name;

    const roleSelect = document.getElementById('updateMemRole');
    roleSelect.value = ['user', 'admin', 'clerk', 'librarian'].includes(role)
      ? role
      : 'user';

    const statusSelect = document.getElementById('updateMemStatus');
    statusSelect.value = ['active', 'inactive'].includes(status)
      ? status
      : 'deleted';
  }

  function handleDeleteClick(e) {
    const row = e.target.closest('tr');
    const userId = row.dataset.id;
    if (confirm('Are you sure you want to delete this user?')) {
      // Add delete logic here
      console.log('Delete user:', userId);
    }
  }

  document.getElementById('memberForm').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const userId = form.getAttribute('data-id');
    const username = document.getElementById('updateMemName').value.trim();
    const role = document.getElementById('updateMemRole').value.trim();
    let status = document.getElementById('updateMemStatus').value.trim();

    if (!username || !role || !status) {
      alert('Please fill in all fields.');
      return;
    }

    // Optionally normalize status (depends on your backend logic)
    if (status === 'inactive') status = 'deleted';

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, role, status }),
      });

      if (!response.ok) throw new Error('Failed to update user');
      alert('User updated successfully!');
      fetchUsers(); // Refresh table
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update user');
    }
  });

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
           Will Return: ${new Date(
             book.returnDate
           ).toLocaleDateString()} | User: ${book.role}
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

  // INVENTORY + book edit/delete
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

  // Initial load
  showSection('Inventory');
  fetchBooks();

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

  // EBOOK INVENTORY

  // Fetch ebook data from API
  async function fetchEbooks(page = 1) {
    try {
      const search = ebookSearchInput.value;
      const url = `/api/books/ebook/admin?search=${search}&page=${page}&limit=10`; // Modify limit as needed
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
      tr.setAttribute('data-id', ebook._id); // Set data-id on the tr for easy access

      tr.innerHTML = `
        <td><img src="${
          ebook.coverImageUrl
        }" alt="Book Cover" width="50" height="75" /></td>
        <td>${ebook.title}</td>
        <td>${ebook.authors.join(', ')}</td>
        <td>${ebook.publishedYear}</td>
        <td>${ebook.genre}</td>
        <td>⭐ ${ebook.averageRating} (${ebook.ratingCount})</td>

        <td>${ebook.status}</td>
        <td><a href="${
          ebook.ebookFileUrl
        }" target="_blank" class="ebook-link">View PDF</a></td>
        <td>
          <button class="edit-btn" data-id="${ebook._id}">Edit</button>
          <button class="ebookSoftDeleteBtn"  style='display:${
            ebook.status === 'deleted' ? 'none' : 'block'
          }'  data-id="${ebook._id}">Delete Tag</button>
             <button class="ebookRecover" style='display:${
               ebook.status === 'deleted' ? 'block' : 'none'
             }' data-id="${ebook._id}">Recover</button>
          <button class="ebookDeleteBtn" data-id="${ebook._id}">Delete</button>
       
        </td>
      `;
      ebookList.appendChild(tr);
    });

    // Rebind edit button event listeners
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', e => {
        const ebookId = e.target.getAttribute('data-id');
        // Find the ebook using the id
        const ebookData = ebooks.find(book => book._id === ebookId);
        if (ebookData) {
          openEditEbook(ebookData); // Pass the found ebook
        }
      });
    });

    // Rebind ebook links
    const ebookLinks = document.querySelectorAll('.ebook-link');
    ebookLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault(); // Prevent default behavior (link navigation)
        const pdfUrl = link.getAttribute('href'); // Get the ebook's file URL
        displayPdf(pdfUrl); // Call the function to display the PDF
      });
    });

    // Soft delete (Delete Tag) button event listener
    const ebookRecoverBtn = document.querySelectorAll('.ebookRecover');
    ebookRecoverBtn.forEach(button => {
      button.addEventListener('click', e => {
        const row = e.target.closest('tr');
        const bookId = row.getAttribute('data-id');
        console.log(bookId);

        if (confirm('Are you sure you want to recover this book?')) {
          recoverEbook(bookId, row);
        }
      });
    });

    const ebookSoftDeleteButtons = document.querySelectorAll(
      '.ebookSoftDeleteBtn'
    );
    ebookSoftDeleteButtons.forEach(button => {
      button.addEventListener('click', e => {
        const row = e.target.closest('tr');
        const bookId = row.getAttribute('data-id');
        console.log(bookId);

        if (confirm('Are you sure you want to delete this book tag?')) {
          deleteEBook(bookId, row);
        }
      });
    });

    // Permanent delete button event listener
    const ebookDeleteButtons = document.querySelectorAll('.ebookDeleteBtn');
    ebookDeleteButtons.forEach(button => {
      button.addEventListener('click', e => {
        const row = e.target.closest('tr');
        const bookId = row.getAttribute('data-id');
        console.log(bookId);

        if (confirm('Are you sure you want to permanently delete this book?')) {
          permanentDeleteEBook(bookId, row);
        }
      });
    });
  }

  //Recover function
  async function recoverEbook(bookId, row) {
    try {
      const response = await fetch(
        `http://127.0.0.1:7001/api/books/ebook/${bookId}/recover`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        row.remove(); // Remove row from the table if the request is successful
        alert('Book tag deleted successfully.');
      } else {
        alert('Failed to delete the book tag.');
      }
    } catch (error) {
      console.error('Error deleting book tag:', error);
      alert('An error occurred while deleting the book tag.');
    }
  }

  // Soft delete function
  async function deleteEBook(bookId, row) {
    try {
      const response = await fetch(
        `http://127.0.0.1:7001/api/books/ebook/${bookId}/delete`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        row.remove(); // Remove row from the table if the request is successful
        alert('Book tag deleted successfully.');
      } else {
        alert('Failed to delete the book tag.');
      }
    } catch (error) {
      console.error('Error deleting book tag:', error);
      alert('An error occurred while deleting the book tag.');
    }
  }

  // Permanent delete function
  async function permanentDeleteEBook(bookId, row) {
    try {
      const response = await fetch(`/api/books/ebook/${bookId}/admin`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        row.remove(); // Remove row from the table if the request is successful
        alert('Book permanently deleted successfully.');
      } else {
        alert('Failed to permanently delete the book.');
      }
    } catch (error) {
      console.error('Error permanently deleting book:', error);
      alert('An error occurred while permanently deleting the book.');
    }
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
  function openEditEbook(ebook) {
    // Set the ebookId somewhere (for form submission later)
    ebookUpdateForm.dataset.ebookId = ebook._id;
    document.getElementById('ebookEditId').value = ebook._id;
    document.getElementById('ebookStatus').value = ebook.status;

    // Populate the text inputs
    document.getElementById('ebookEditTitle').value = ebook.title || '';
    document.getElementById('ebookEditAuthors').value =
      ebook.authors?.join(', ') || '';

    document.getElementById('ebookEditYear').value = ebook.publishedYear || '';
    document.getElementById('ebookEditGenre').value = ebook.genre || '';

    // Display current cover image
    const coverPreview = document.getElementById('coverImagePreview');
    if (coverPreview) {
      coverPreview.src = ebook.coverImageUrl || '';
      coverPreview.style.display = ebook.coverImageUrl ? 'block' : 'none';
    }

    // Display current ebook file link
    const fileLink = document.getElementById('ebookFilePreview');
    if (fileLink) {
      fileLink.href = ebook.ebookFileUrl || '#';
      fileLink.textContent = ebook.ebookFileUrl ? 'View Current File' : '';
      fileLink.style.display = ebook.ebookFileUrl ? 'inline-block' : 'none';
    }

    // Show the modal
    ebookUpdateModal.style.display = 'block';
    ebookUpdateForm.style.display = 'block';
  }

  // Handle ebook update form submission
  ebookUpdateForm.addEventListener('submit', async e => {
    e.preventDefault();

    const ebookId = document.getElementById('ebookEditId').value; // get the stored id
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
});
