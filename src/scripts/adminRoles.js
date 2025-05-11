// Sample data for demonstration
const users = [
  { name: 'John Doe', role: 'Admin', status: 'Active' },
  { name: 'Jane Smith', role: 'Clerk', status: 'Inactive' },
  { name: 'Alice Johnson', role: 'User', status: 'Active' },
];

// Function to create the roles table dynamically
function createRolesTable(users) {
  const container = document.querySelector('.container');

  // Create the table element
  const table = document.createElement('table');
  table.className = 'roles-table';

  // Create the table header
  table.innerHTML = `
    <thead>
      <tr>
        <th>Name</th>
        <th>Role</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  `;

  // Append the table to the container
  container.appendChild(table);

  // Get the table body
  const tbody = table.querySelector('tbody');

  // Populate the table with user data
  users.forEach((user, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.role}</td>
      <td>${user.status}</td>
      <td>
        <button class="update-btn" data-index="${index}">Update</button>
        <button class="delete-btn" data-index="${index}">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // Add event listeners to the update buttons
  document.querySelectorAll('.update-btn').forEach(button => {
    button.addEventListener('click', openUpdateModal);
  });

  // Add event listeners to the delete buttons
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', deleteUser);
  });
}

// Function to open the update modal
function openUpdateModal(event) {
  const index = event.target.getAttribute('data-index');
  const user = users[index];

  // Populate the form with the user's current data
  document.getElementById('updateName').value = user.name;
  document.getElementById('updateRole').value = user.role;

  // Show the modal
  const modal = document.getElementById('updateModal');
  modal.style.display = 'flex';

  // Handle form submission
  const form = document.getElementById('updateForm');
  form.onsubmit = function (e) {
    e.preventDefault();

    // Update the user's data
    user.name = document.getElementById('updateName').value;
    user.role = document.getElementById('updateRole').value;

    // Close the modal and refresh the table
    modal.style.display = 'none';
    document.querySelector('.roles-table').remove();
    createRolesTable(users);
  };
}

// Function to delete a user
function deleteUser(event) {
  const index = event.target.getAttribute('data-index');

  // Remove the user from the array
  users.splice(index, 1);

  // Refresh the table
  document.querySelector('.roles-table').remove();
  createRolesTable(users);
}

// Close the modal when the close button is clicked
document.querySelector('.close-btn').addEventListener('click', () => {
  document.getElementById('updateModal').style.display = 'none';
});

// Call the function to create the table
createRolesTable(users);