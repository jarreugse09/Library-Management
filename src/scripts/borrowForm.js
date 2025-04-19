const bookSelect = document.getElementById('bookTitle');
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
      option.value = book.title;
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

// Define handleSubmit as an async function
async function handleSubmit(e) {
  e.preventDefault(); // Prevent default form submission

  // Collect form data
  const formData = {
    bookTitle: document.getElementById('bookTitle').value,
    borrowerName: document.getElementById('borrowerName').value,
    contactInfo: document.getElementById('contactInfo').value,
    borrowDate: document.getElementById('borrowDate').value,
    returnDate: document.getElementById('returnDate').value,
    notes: document.getElementById('notes').value,
  };

  try {
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
