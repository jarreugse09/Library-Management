function addAuthor() {
  const container = document.getElementById('authors-container');
  const div = document.createElement('div');
  div.innerHTML = `
    <input type="text" name="authors[]" required />
    <button type="button" class="btn btn-remove" onclick="removeAuthor(this)">Remove</button>
  `;
  container.appendChild(div);
}

function removeAuthor(button) {
  const div = button.parentElement;
  div.remove();
}

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const author = formData.getAll('author[]');
  const bookData = {
    donorName: formData.get('donorName'),
    title: formData.get('title'),
    author: author,
    publishedYear: formData.get('publishedYear'),
    genre: formData.get('genre'),
  };

  console.log('Book submitted: ', bookData);
  alert('Book submitted successfully!');
  event.target.reset();

  const authorsContainer = document.getElementById('authors-container');
  authorsContainer.innerHTML = `
    <label>Author(s)</label>
    <div>
      <input type="text" name="authors[]" required />
      <button type="button" class="btn btn-remove" onclick="removeAuthor(this)">Remove</button>
    </div>
  `;
}

function toggleFields() {
  const bookType = document.querySelector(
    'input[name="bookType"]:checked'
  ).value;

  const quantityField = document.getElementById('quantityField');
  const ebookFileField = document.getElementById('ebookFileField');
  const quantityInput = document.getElementById('quantityInput');

  if (bookType === 'physical') {
    quantityField.style.display = 'block';
    ebookFileField.style.display = 'none';
    quantityInput.setAttribute('required', 'true'); // Make it required for physical books
  } else if (bookType === 'ebook') {
    quantityField.style.display = 'none';
    ebookFileField.style.display = 'block';
    quantityInput.removeAttribute('required'); // Remove the required attribute for e-books
  }
}

// Call toggleFields() when the page loads to ensure correct fields are visible initially
document.addEventListener('DOMContentLoaded', toggleFields);
function toggleFields() {
  const bookType = document.querySelector(
    'input[name="bookType"]:checked'
  ).value;

  const quantityField = document.getElementById('quantityField');
  const ebookFileField = document.getElementById('ebookFileInput');
  const quantityInput = document.getElementById('quantityInput');

  if (bookType === 'physical') {
    quantityField.style.display = 'block';
    ebookFileField.style.display = 'none';
    quantityInput.setAttribute('required', 'true'); // Make it required for physical books
  } else if (bookType === 'ebook') {
    quantityField.style.display = 'none';
    ebookFileField.style.display = 'block';
    quantityInput.removeAttribute('required'); // Remove the required attribute for e-books
  }
}

// Call toggleFields() when the page loads to ensure correct fields are visible initially
document.addEventListener('DOMContentLoaded', toggleFields);

async function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  const bookType = formData.get('bookType');

  // Log all values for debugging
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  try {
    const response = await fetch('http://127.0.0.1:7001/api/donations/donate', {
      method: 'POST',
      body: formData, // ✅ Send FormData directly
    });
    // Handle the response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error submitting donation');
    }

    const data = await response.json();
    alert('Donation submitted successfully!');
    event.target.reset(); // Reset the form

    // Optionally reset authors container
    const authorsContainer = document.getElementById('authors-container');
    authorsContainer.innerHTML = `
      <label>Author(s)</label>
      <div>
        <input type="text" name="authors[]" required />
        <button type="button" class="btn btn-remove" onclick="removeAuthor(this)">Remove</button>
      </div>
    `;
  } catch (error) {
    console.error('Error submitting donation:', error);
    alert('An error occurred: ' + error.message);
  }
}
