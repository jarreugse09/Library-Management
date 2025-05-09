const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

document
  .getElementById('reset-password-form')
  .addEventListener('submit', async e => {
    e.preventDefault();
    console.log(token);
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:7001/api/users/resetPassword/${token}`,
        {
          method: 'PATCH', // Ensure this is PATCH
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password, confirmPassword }),
        }
      );

      const data = await response.json();
      if (data.status === 'success') {
        alert('Password updated successfully!');
        window.location.href = '/'; // Redirect to login page
      }
    } catch (error) {
      alert('Error updating password. Please try again.');
    }
  });

function handleCancel() {
  document.querySelector('form').reset();
}

const cancelButton = document.getElementById('cancel');

// Bind it to the cancel button
cancelButton.addEventListener('click', handleCancel);
