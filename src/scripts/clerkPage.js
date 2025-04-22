document.addEventListener('DOMContentLoaded', () => {
  const sections = {
    Inventory: document.getElementById('Inventory'),
    donation: document.getElementById('donation'),
    borrow: document.getElementById('borrow'),
  };

  const links = {
    inventory: document.getElementById('inventoryLink'),
    donation: document.getElementById('donationLink'),
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
      donationLogs.forEach(log => {
        const listItem = document.createElement('li');
        const date = new Date(log.timestamp).toLocaleString();
        listItem.textContent = `DATE: [${date}] USER: ${log.role} ACTION: ${log.action} Donated Book ID: ${log.refId}`;
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
