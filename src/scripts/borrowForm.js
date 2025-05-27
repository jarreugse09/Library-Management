const bookSelect =
  document.getElementById('bookTitle');
const borrowForm =
  document.getElementById('borrowForm');
let hasLoadedBooks = false;
const token = localStorage.getItem('jwt');

document.addEventListener(
  'DOMContentLoaded',
  async () => {
    // Fetch user info and set button visibility
    try {
      const response = await fetch(
        '/api/auth/me',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        alert(
          'Session expired. Please log in again.'
        );
        localStorage.removeItem('jwt');
        window.location.href = '/';
        return;
      }

      if (!response.ok)
        throw new Error('Fetch failed');

      user = await response.json();

      if (user.role === 'clerk') {
        document.getElementById(
          'clerkBtn'
        ).style.display = 'block';
        document.getElementById(
          'adminBtn'
        ).style.display = 'none';
      } else if (
        user.role === 'admin' ||
        user.role === 'librarian'
      ) {
        document.getElementById(
          'adminBtn'
        ).style.display = 'block';
        document.getElementById(
          'clerkBtn'
        ).style.display = 'none';
      } else {
        document.getElementById(
          'adminBtn'
        ).style.display = 'none';
        document.getElementById(
          'clerkBtn'
        ).style.display = 'none';
        await logoutUser();
        window.location.href = '/';
        return;
      }
    } catch (err) {
      console.error(err);
      alert('Could not load user data.');
    }
  }
);

document.addEventListener(
  'DOMContentLoaded',
  async () => {
    const token = localStorage.getItem('jwt');

    if (!token) {
      alert('Not logged in');
      return (window.location.href = '/');
    }

    try {
      const response = await fetch(
        '/api/auth/me',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        alert(
          'Session expired. Please log in again.'
        );
        localStorage.removeItem('jwt');
        window.location.href = '/';
        return;
      }

      if (!response.ok)
        throw new Error('Fetch failed');

      user = await response.json();

      document.getElementById(
        'borrowerName'
      ).value =
        `${user.firstName} ${user.lastName}` ||
        'N/A';
      document.getElementById(
        'contactInfo'
      ).value = user.email || 'N/A';
    } catch (error) {
      console.error(error);
      alert('Could not load user data.');
    }
  }
);

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

    alert(
      'You have been successfully logged out.'
    );

    window.location.href = '/'; // Redirect to login or home page
  } catch (err) {
    console.error('Logout failed', err);
    alert('Logout failed. Please try again.');
  }
}

document
  .getElementById('logoutBtn')
  .addEventListener('click', async () => {
    logoutUser();
  });

// Fetch and populate book titles
bookSelect.addEventListener('click', async () => {
  if (hasLoadedBooks) return;
  hasLoadedBooks = true;

  bookSelect.innerHTML =
    '<option>Loading...</option>';

  try {
    const res = await fetch(
      '/api/books/physical/title',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok)
      throw new Error('Failed to fetch books');

    const data = await res.json();
    bookSelect.innerHTML =
      '<option value="">Select a book title</option>';

    data.forEach(book => {
      const option =
        document.createElement('option');
      option.value = book._id; // VALUE is the book's ID
      option.textContent = book.title; // Display the title
      bookSelect.appendChild(option);
    });

    if (data.length === 0) {
      bookSelect.innerHTML =
        '<option>No books available</option>';
    }
  } catch (error) {
    console.error('Error loading books:', error);
    bookSelect.innerHTML =
      '<option>Error loading books</option>';
  }
});

// Handle form submission
borrowForm.addEventListener(
  'submit',
  async event => {
    event.preventDefault();

    const formData = {
      borrowedBookId: borrowForm.bookId.value, // the selected book _id
      borrowerName: borrowForm.borrowerName.value,
      contactInfo: borrowForm.contactInfo.value,
      borrowDate: borrowForm.borrowDate.value,
      returnDate: borrowForm.returnDate.value,
      notes: borrowForm.notes.value,
    };
    if (formData.borrowDate < Date.now()) {
      return alert('Invalid borrow date input');
    }
    try {
      const res = await fetch(
        '/api/borrows/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        throw new Error(
          'Failed to submit borrow request'
        );
      }

      const result = await res.json();
      alert(
        'Borrow request submitted successfully!'
      );
      console.log('Success:', result);

      borrowForm.reset(); // Clear the form after submission
      hasLoadedBooks = false; // optional: re-fetch books if needed next time
    } catch (error) {
      console.error(
        'Error submitting borrow request:',
        error
      );
      alert(
        'Something went wrong. Please try again.'
      );
    }
  }
);
