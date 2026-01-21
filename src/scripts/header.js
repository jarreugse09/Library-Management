document.addEventListener("DOMContentLoaded", () => {
  const settingsToggle = document.getElementById("settingsToggle");
  const settingsDropdown = document.getElementById("settingsDropdown");
  const header = document.querySelector(".header");

  // Assuming 'userRole' is available globally
  const userRole = window.userRole || ""; // Default to empty if not set

  // Function to update button visibility based on user role
  const updateButtonVisibility = () => {
    if (userRole === "admin") {
      document.getElementById("adminBtn").style.display = "block";
    } else {
      document.getElementById("adminBtn").style.display = "none";
    }

    if (userRole === "clerk") {
      document.getElementById("clerkBtn").style.display = "block";
    } else {
      document.getElementById("clerkBtn").style.display = "none";
    }
  };

  // Call the function to update visibility when page loads
  updateButtonVisibility();

  // Initialize dropdown state - dropdown is hidden by default in CSS
  settingsDropdown.classList.remove("show");

  // Enhanced toggle function with animations
  const toggleDropdown = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const isOpen = settingsDropdown.classList.contains("show");

    if (!isOpen) {
      // Closing any other open dropdowns
      document.querySelectorAll(".dropdown-menu.show").forEach((menu) => {
        if (menu !== settingsDropdown) {
          menu.classList.remove("show");
        }
      });

      // Open this dropdown
      settingsDropdown.classList.add("show");
    } else {
      // Close dropdown
      settingsDropdown.classList.remove("show");
    }
  };

  // Click handler for dropdown toggle
  settingsToggle.addEventListener("click", toggleDropdown);

  // Close when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !settingsToggle.contains(event.target) &&
      !settingsDropdown.contains(event.target)
    ) {
      settingsDropdown.classList.remove("show");
    }
  });

  // Keyboard accessibility
  settingsToggle.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleDropdown(event);
    } else if (
      event.key === "Escape" &&
      settingsDropdown.classList.contains("show")
    ) {
      settingsDropdown.classList.remove("show");
    }
  });

  // Smooth scroll prevention for sticky header
  let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll <= 0) {
      header.style.transform = "none";
    } else if (currentScroll > lastScroll) {
      // Scrolling down
      header.style.transform = "translateY(-100%)";
    } else {
      // Scrolling up
      header.style.transform = "none";
    }
    lastScroll = currentScroll;
  });
});
