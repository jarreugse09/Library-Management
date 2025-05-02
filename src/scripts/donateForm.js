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

function resetForm() {
  const confirmCancel = confirm('Are you sure you want to cancel?');
  if (confirmCancel) {
    // Redirect or reset form
    window.location.href = '/userPage/'; // Or wherever you want to go
    // OR: document.getElementById("donateForm").reset();
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const bookType = formData.get('bookType');

  // Manually collect all selected genres from checkboxes
  const checkedGenres = Array.from(
    document.querySelectorAll('input[name="genre[]"]:checked')
  ).map(input => input.value);

  // Add the "Other" genre if visible and filled
  const otherInput = document.getElementById('other-genre-input');
  const otherGenre = otherInput?.value.trim();
  if (otherInput?.style.display !== 'none' && otherGenre) {
    checkedGenres.push(otherGenre);
  }

  // Clear previous genre[] entries to prevent duplicates
  formData.delete('genre[]');

  // Append combined genres to the formData
  checkedGenres.forEach(genre => {
    formData.append('genre[]', genre);
  });

  // Remove ebook file if the book is physical
  if (bookType === 'physical') {
    formData.delete('ebookFile');
    formData.delete('coverImage'); // Also remove cover image for physical books
  }

  // Debug log of the form submission
  console.log('Form Data:', formData);

  try {
    // Debug logs to ensure proper data collection
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Submitting the form using fetch
    const response = await fetch('http://127.0.0.1:7001/api/donations/donate', {
      method: 'POST',
      body: formData, // The form data should be passed here
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error submitting donation');
    }

    const data = await response.json();
    console.log(data.data);
    alert('Donation submitted successfully!');
    form.reset();

    // Reset authors UI
    const authorsContainer = document.getElementById('authors-container');
    authorsContainer.innerHTML = `
      <label>Author(s)</label>
      <div>
        <input type="text" name="authors[]" required />
        <button type="button" class="btn btn-remove" onclick="removeAuthor(this)">Remove</button>
      </div>
    `;

    // Reset "Other genre" input
    if (otherInput) {
      otherInput.style.display = 'none';
      otherInput.value = '';
    }
  } catch (error) {
    console.error('Error submitting donation:', error);
    alert('An error occurred: ' + error.message);
  }
}

async function loadGenres() {
  const res = await fetch('/api/books/genre/'); // Replace with your actual route
  const genres = await res.json(); // Assume it returns an array like ['Fiction', 'Mystery', ...]

  const container = document.getElementById('genre-checkboxes');
  container.innerHTML = ''; // Clear existing content

  genres.forEach(genre => {
    const label = document.createElement('label');
    label.innerHTML = `
    <input type="checkbox" name="genre[]" value="${
      genre.name
    }"> ${genre.name.toUpperCase()}
  `;
    container.appendChild(label);
  });

  // Add the "Other" option
  const otherLabel = document.createElement('label');
  otherLabel.innerHTML = `
  <input type="checkbox" id="genre-other"> Other
`;
  container.appendChild(otherLabel);

  // Add toggle logic for "Other"
  const otherCheckbox = otherLabel.querySelector('#genre-other');
  const otherInput = document.getElementById('other-genre-input');

  otherCheckbox.addEventListener('change', () => {
    otherInput.style.display = otherCheckbox.checked ? 'block' : 'none';
    if (!otherCheckbox.checked) otherInput.value = '';
  });
}

loadGenres();
