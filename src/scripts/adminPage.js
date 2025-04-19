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
        `http://localhost:7001/api/donations/${donationId}/${action}/`,
        {
          method: 'PATCH',
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
});

async function fetchBorrowedBooks() {
  try {
    const response = await fetch(
      'http://127.0.0.1:7001/api/books/physical/borrowed'
    ); // Replace with your actual endpoint
    const borrowedBooks = await response.json();

    const borrowLog = document.getElementById('borrowLog');
    borrowLog.innerHTML = ''; // Clear the list before appending new items

    if (!borrowedBooks.length) {
      borrowLog.innerHTML = '<li>No borrowed books found.</li>';
    } else {
      borrowedBooks.forEach(book => {
        const li = document.createElement('li');
        li.textContent = `${book.bookTitle} - Borrower: ${
          book.borrowerName
        } | Borrowed: ${new Date(
          book.borrowDate
        ).toLocaleDateString()} | Return: ${new Date(
          book.returnDate
        ).toLocaleDateString()}`;
        borrowLog.appendChild(li);
      });
    }

    // Show the borrowed section
    document.getElementById('borrow').style.display = 'block';
    document.getElementById('borrowedLogs').style.display = 'block';
  } catch (error) {
    console.error('Error fetching borrowed books:', error);
    alert('Failed to fetch borrowed books. Please try again.');
  }
}
