const bookSelect = document.getElementById('bookTitle');
const bookIdInput = document.getElementById('bookId');
let hasLoadedBooks = false;

bookSelect.addEventListener('click', async () => {
  if (hasLoadedBooks) return; // prevent refetching on every click
  hasLoadedBooks = true;

  bookSelect.innerHTML = '<option>Loading...</option>';

  try {
    const res = await fetch('http://127.0.0.1:7001/api/books/physical/title');
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();

    bookSelect.innerHTML = '<option value="">Select a book title</option>';

    data.forEach(book => {
      const option = document.createElement('option');
      option.value = book._id; // Set the _id as the value!
      option.textContent = book.title;
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

// When a book is selected, update the hidden input with the book ID
bookSelect.addEventListener('change', () => {
  const selectedBookId = bookSelect.value;
  bookIdInput.value = selectedBookId;
});

// Define handleSubmit as an async function
async function handleSubmit(e) {
  e.preventDefault(); // Prevent default form submission

  // Collect form data
  const formData = {
    borrowedBookId: document.getElementById('bookId').value,
    borrowerName: document.getElementById('borrowerName').value,
    contactInfo: document.getElementById('contactInfo').value,
    borrowDate: document.getElementById('borrowDate').value,
    returnDate: document.getElementById('returnDate').value,
    notes: document.getElementById('notes').value,
  };

  try {
    console.log(formData);
    // Send the form data to the API endpoint
    const response = await fetch('http://127.0.0.1:7001/api/borrows/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    if (response.ok) {
      alert('Borrow request submitted successfully!');
      e.target.reset(); // Reset the form
    } else {
      const error = await response.text();
      alert('Failed to submit request: ' + error);
    }
  } catch (err) {
    console.error('Error submitting borrow request:', err);
    alert('An error occurred while submitting the request.');
  }
}
