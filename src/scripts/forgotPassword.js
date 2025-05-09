document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const emailInput = document.getElementById('email');
  const cancelButton = document.getElementById('cancel');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const email = emailInput.value.trim();

    if (!validateEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:7001/api/users/forgotPassword',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert('Password reset link has been sent to your email.');
        emailInput.value = '';
      } else {
        alert(`Error: ${result.message || 'Something went wrong.'}`);
      }
    } catch (error) {
      alert('Request failed. Please try again.');
      console.error('Reset password error:', error);
    }
  });

  // ✅ Modified cancel button behavior
  // Define the cancel redirect function
  function handleCancel() {
    window.location.href = '/';
  }

  // Bind it to the cancel button
  cancelButton.addEventListener('click', handleCancel);

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});
