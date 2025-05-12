const bookSelect = document.getElementById('bookTitle');
const borrowForm = document.getElementById('borrowForm');
let hasLoadedBooks = false;
const token = localStorage.getItem('jwt');

if (!token) {
  alert('Not logged in');
  window.location.href = '/';
}

async function logoutUser() {
  try {
    const token = localStorage.getItem('jwt');

    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.removeItem('jwt'); // Remove JWT

    alert('You have been successfully logged out.');

    window.location.href = '/'; // Redirect to login or home page
  } catch (err) {
    console.error('Logout failed', err);
    alert('Logout failed. Please try again.');
  }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
  logoutUser();
});

// Fetch and populate book titles
bookSelect.addEventListener('click', async () => {
  if (hasLoadedBooks) return;
  hasLoadedBooks = true;

  bookSelect.innerHTML = '<option>Loading...</option>';

  try {
    const res = await fetch('http://127.0.0.1:7001/api/books/physical/title', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch books');

    const data = await res.json();
    bookSelect.innerHTML = '<option value="">Select a book title</option>';

    data.forEach(book => {
      const option = document.createElement('option');
      option.value = book._id; // VALUE is the book's ID
      option.textContent = book.title; // Display the title
      bookSelect.appendChild(option);
    });

    if (data.length === 0) {
      bookSelect.innerHTML = '<option>No books available</option>';
    }
  } catch (error) {
    console.error('Error loading books:', error);
    bookSelect.innerHTML = '<option>Error loading books</option>';
  }
});

// Handle form submission
borrowForm.addEventListener('submit', async event => {
  event.preventDefault();

  const formData = {
    borrowedBookId: borrowForm.bookId.value, // the selected book _id
    borrowerName: borrowForm.borrowerName.value,
    contactInfo: borrowForm.contactInfo.value,
    borrowDate: borrowForm.borrowDate.value,
    returnDate: borrowForm.returnDate.value,
    notes: borrowForm.notes.value,
  };

  try {
    const res = await fetch('http://127.0.0.1:7001/api/borrows/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error('Failed to submit borrow request');
    }

    const result = await res.json();
    alert('Borrow request submitted successfully!');
    console.log('Success:', result);

    borrowForm.reset(); // Clear the form after submission
    hasLoadedBooks = false; // optional: re-fetch books if needed next time
  } catch (error) {
    console.error('Error submitting borrow request:', error);
    alert('Something went wrong. Please try again.');
  }
});
