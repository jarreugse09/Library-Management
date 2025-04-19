async function fetchPendingDonations() {
  try {
    const response = await fetch('http://localhost:7001/api/donations/pending');
    if (!response.ok) throw new Error('Failed to fetch');

    const donations = await response.json();
    const list = document.getElementById('donationList');
    list.innerHTML = ''; // clear list before rendering

    donations.forEach(donation => {
      const li = document.createElement('li');
      li.innerHTML = `
          <strong>${donation.title}</strong><br>
          Donated by: ${donation.donorName}<br>
          Authors: ${donation.authors.join(', ')}<br>Book Type: ${
        donation.bookType
      }<br>
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

fetchPendingDonations();
