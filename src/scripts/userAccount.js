let user;

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

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('jwt');

  if (!token) {
    alert('Not logged in');
    return (window.location.href = '/');
  }

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

    document.getElementById('username').textContent = user.username || 'N/A';
    document.getElementById('first-name').textContent = user.firstName || 'N/A';
    document.getElementById('last-name').textContent = user.lastName || 'N/A';

    document.getElementById('email').textContent = user.email || 'N/A';
    document.getElementById('created-at').textContent = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : 'N/A';
    document.getElementById('status').textContent = user.isVerified
      ? 'Active'
      : 'Not Verified';
    document.getElementById('last-login').textContent = user.lastLogin
      ? new Date(user.lastLogin).toLocaleString()
      : 'Never';
  } catch (err) {
    console.error(err);
    alert('Could not load user data.');
  }

  // Handle "Change Password" button
  document.getElementById('change-password').addEventListener('click', () => {
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('user-password-container').style.display = 'block';
  });

  // Handle Password Update Form Submission
  document
    .getElementById('update-password-form')
    .addEventListener('submit', async e => {
      e.preventDefault(); // Prevent form from submitting through URL

      const currentPassword = document.getElementById('currentPassword').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (!currentPassword || !password || !confirmPassword) {
        alert('Please fill out all fields');
        return;
      }

      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      try {
        const response = await fetch(`/api/auth/${user._id}/update-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword: password,
          }),
        });

        const data = await response.json();
        if (data.status === 'success') {
          alert('Password updated successfully!');
          window.location.href = '/';
        } else {
          alert(data.message || 'Failed to update password.');
        }
      } catch (error) {
        console.error(error);
        alert('Error updating password. Please try again.');
      }
    });
});

// Optional: Utility function for formatting relative time
function timeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (let key in intervals) {
    const interval = Math.floor(seconds / intervals[key]);
    if (interval >= 1) {
      return `${interval} ${key}${interval > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}
