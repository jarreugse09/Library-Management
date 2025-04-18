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

      // Log the data to debug the structure
      console.log(data);

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
          <strong>Book Title: ${borrow.bookTitle}</strong><br>
          Borrowed by: ${borrow.borrowerName}<br>
          Contact Info: ${borrow.contactInfo}<br>
          Borrow Date: ${new Date(borrow.borrowDate).toLocaleDateString()}<br>
          Expected Return Date: ${new Date(
            borrow.returnDate
          ).toLocaleDateString()}<br><br>
          <button class="approve-btn">Approve</button>
          <button class="reject-btn">Reject</button>
        `;

        // Attach handlers to buttons
        listItem
          .querySelector('.approve-btn')
          .addEventListener('click', () =>
            handleActionBorrow(borrow._id, 'approve')
          );
        listItem
          .querySelector('.reject-btn')
          .addEventListener('click', () =>
            handleActionBorrow(borrow._id, 'reject')
          );

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
        }
      );
      console.log(response);

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

  // Optional: Load default view
  showSection('Inventory');
});
