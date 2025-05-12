const token = localStorage.getItem('jwt');
let user = null;

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

document.addEventListener('DOMContentLoaded', async () => {
  // Fetch user info and set button visibility
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      alert('Session expired. Please log in again.');
      localStorage.removeItem('jwt');
      window.location.href = '/';
      return;
    }

    if (!response.ok) throw new Error('Fetch failed');

    user = await response.json();

    if (user.role === 'clerk') {
      document.getElementById('clerkBtn').style.display = 'block';
      document.getElementById('adminBtn').style.display = 'none';
    } else if (user.role === 'admin' || user.role === 'librarian') {
      document.getElementById('adminBtn').style.display = 'block';
      document.getElementById('clerkBtn').style.display = 'none';
    } else {
      document.getElementById('adminBtn').style.display = 'none';
      document.getElementById('clerkBtn').style.display = 'none';
      await logoutUser();
      window.location.href = '/';
      return;
    }
  } catch (err) {
    console.error(err);
    alert('Could not load user data.');
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  logoutUser();
});

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
  const ebookImageField = document.getElementById('ebookImageInput');
  const quantityInput = document.getElementById('quantityInput');

  if (bookType === 'physical') {
    quantityField.style.display = 'block';
    ebookFileField.style.display = 'none';
    ebookImageField.style.display = 'none';
    quantityInput.setAttribute('required', 'true'); // Make it required for physical books
  } else if (bookType === 'ebook') {
    quantityField.style.display = 'none';
    ebookFileField.style.display = 'block';
    ebookImageField.style.display = 'block';
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

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('donateForm');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
});

async function handleSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector('.btn-submit');
  submitBtn.disabled = true;

  try {
    const formData = new FormData(form);
    const bookType = formData.get('bookType');

    // Gather checked genres
    const checkedGenres = Array.from(
      document.querySelectorAll('input[name="genre[]"]:checked')
    ).map(input => input.value);

    // Include 'Other' genre input if visible
    const otherInput = document.getElementById('other-genre-input');
    if (
      otherInput &&
      otherInput.style.display !== 'none' &&
      otherInput.value.trim()
    ) {
      checkedGenres.push(otherInput.value.trim());
    }

    // Clear old genre entries, append updated ones
    formData.delete('genre[]');
    checkedGenres.forEach(genre => formData.append('genre[]', genre));

    // 🔄 Send all fields including ebookFile (even for physical books)
    console.log('--- FormData being submitted ---');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await fetch('http://127.0.0.1:7001/api/donations/donate', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error Response:', error);
      throw new Error(error.message || 'Failed to donate book.');
    }

    const result = await response.json();
    alert('Donation submitted successfully!');
    form.reset();

    // Reset authors section
    const authorsContainer = document.getElementById('authors-container');
    authorsContainer.innerHTML = `
      <label for="authors-1">Author(s)</label>
      <div>
        <input id="authors-1" type="text" name="authors[]" required />
        <button type="button" class="btn btn-remove" onclick="removeAuthor(this)">Remove</button>
      </div>
    `;

    if (otherInput) {
      otherInput.style.display = 'none';
      otherInput.value = '';
    }

    toggleFields(); // Reset visibility of conditional fields
    await loadGenres(); // Reload dynamic genre list
  } catch (error) {
    console.error('Submission Error:', error);
    alert('Error: ' + error.message);
  } finally {
    submitBtn.disabled = false;
  }
}

async function loadGenres() {
  const res = await fetch('/api/books/genre/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }); // Replace with your actual route
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
