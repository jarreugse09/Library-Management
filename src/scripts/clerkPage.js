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

  // Helper to show one section and hide others
  function showSection(activeSection) {
    Object.keys(sections).forEach(key => {
      sections[key].style.display = key === activeSection ? 'block' : 'none';
    });
  }

  // Sidebar link click handlers
  links.inventory.addEventListener('click', () => {
    showSection('Inventory');
  });

  links.donation.addEventListener('click', () => {
    showSection('donation');
  });

  links.borrowed.addEventListener('click', () => {
    showSection('borrow');
    pendingBorrow.style.display = 'block';
    borrowedLogs.style.display = 'none';
  });

  // Button toggles inside borrow section
  pendingBtn.addEventListener('click', () => {
    pendingBorrow.style.display = 'block';
    borrowedLogs.style.display = 'none';
  });

  logsBtn.addEventListener('click', () => {
    pendingBorrow.style.display = 'none';
    borrowedLogs.style.display = 'block';
  });

  //donation toggles

  donationPendingBtn.addEventListener('click', () => {
    donationPending.style.display = 'block';
    donationLogs.style.display = 'none';
  });

  donationLogsBtn.addEventListener('click', () => {
    donationPending.style.display = 'none';
    donationLogs.style.display = 'block';
  });

  // 👇 Default to show Inventory on page load
  showSection('Inventory');
});

// Donation fetch logic
async function fetchPendingDonations() {
  try {
    const response = await fetch('http://localhost:7001/api/donations/pending');
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

// Borrowed fetch logic
async function fetchPendingBorrows() {
  try {
    const response = await fetch('http://localhost:7001/api/borrows/pending');
    if (!response.ok) throw new Error('Failed to fetch');

    const borrows = await response.json();
    const list = document.getElementById('borrowList');
    list.innerHTML = '';

    borrows.forEach(borrow => {
      const li = document.createElement('li');
      li.innerHTML = `
          <strong>${borrow.title}</strong><br>
          Borrowed by: ${borrow.borrowerName}<br>
          Date Requested: ${new Date(
            borrow.requestDate
          ).toLocaleDateString()}<br>
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
    console.error('Error fetching borrows:', err);
  }
}
async function fetchPendingBorrowed() {
  try {
    const response = await fetch('http://localhost:7001/api/borrow/pending');
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
      `http://localhost:7001/api/donations/${donationId}/${action}`,
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
