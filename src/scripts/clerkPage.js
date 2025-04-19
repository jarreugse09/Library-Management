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
      list.innerHTML = '';

      donations.forEach(donation => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${donation.title}</strong><br>
            Donated by: ${donation.donorName}<br>
            Authors: ${donation.authors.join(', ')}<br>
            Book Type: ${donation.bookType}<br>
            Published Year: ${donation.publishedYear || 'N/A'}<br>
            <button onclick="handleAction('${
              donation._id
            }', 'approve')">Approve</button>
            <button onclick="handleAction('${
              donation._id
            }', 'reject')">Reject</button>
            <hr>
          `;
        list.appendChild(li);
      });
    } catch (err) {
      console.error('Error fetching donations:', err);
    }
  }

  async function fetchPendingBorrows() {
    try {
      const response = await fetch('/clerkPage/borrows/pending/');
      if (!response.ok) throw new Error('Failed to fetch borrows');
      const data = await response.json();

      borrowList.innerHTML = '';

      if (data.length === 0) {
        borrowList.innerHTML = '<li>No pending borrow requests found.</li>';
        return;
      }

      data.forEach(borrow => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${borrow.title}</strong><br>
            Borrowed by: ${borrow.borrowerName}<br>
            Date Requested: ${new Date(
              borrow.requestDate
            ).toLocaleDateString()}<br><br>
          `;
        borrowList.appendChild(listItem);
      });
    } catch (err) {
      console.error('Error loading borrows:', err);
      borrowList.innerHTML = '<li>Error loading borrow requests.</li>';
    }
  }

  // Optional: Load default view
  showSection('Inventory');
});

async function fetchPendingBorrowed() {
  try {
    const response = await fetch(
      'http://localhost:7001/clerkPage/borrow/pending'
    );
    if (!response.ok) throw new Error('Failed to fetch');

    const borrowedBooks = await response.json();
    const list = document.getElementById('borrowList');
    list.innerHTML = '';

    borrowedBooks.forEach(borrow => {
      const li = document.createElement('li');
      li.innerHTML = `
          <strong>${borrow.bookTitle}</strong><br>
          Borrowed by: ${borrow.borrowerName}<br>
          Requested on: ${new Date(borrow.requestDate).toLocaleDateString()}<br>
          <button onclick="handleBorrowAction('${
            borrow._id
          }', 'approve')">Approve</button>
          <button onclick="handleBorrowAction('${
            borrow._id
          }', 'reject')">Reject</button>
          <hr>
        `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Error fetching borrowed books:', err);
  }
}

async function handleAction(donationId, action) {
  try {
    const response = await fetch(
      `http://localhost:7001/donations/${donationId}/${action}`,
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
