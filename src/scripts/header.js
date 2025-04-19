document.addEventListener("DOMContentLoaded", () => {
  const settingsToggle = document.getElementById("settingsToggle");
  const settingsDropdown = document.getElementById("settingsDropdown");
  const header = document.querySelector(".header");
  
  // Initialize dropdown state
  settingsDropdown.classList.add("hidden");
  
  // Enhanced toggle function with animations
  const toggleDropdown = (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      const isOpening = settingsDropdown.classList.contains("hidden");
      
      if (isOpening) {
          // Closing any other open dropdowns
          document.querySelectorAll('.dropdown-menu:not(.hidden)').forEach(menu => {
              if (menu !== settingsDropdown) {
                  menu.classList.add('hidden');
              }
          });
          
          // Open this dropdown
          settingsDropdown.classList.remove("hidden");
          setTimeout(() => {
              settingsDropdown.style.opacity = "1";
              settingsDropdown.style.transform = "translateY(0)";
          }, 10);
      } else {
          // Close dropdown with animation
          settingsDropdown.style.opacity = "0";
          settingsDropdown.style.transform = "translateY(10px)";
          setTimeout(() => {
              settingsDropdown.classList.add("hidden");
          }, 300);
      }
  };
  
  // Click handler for dropdown toggle
  settingsToggle.addEventListener("click", toggleDropdown);
  
  // Close when clicking outside
  document.addEventListener("click", (event) => {
      if (!settingsToggle.contains(event.target) && !settingsDropdown.contains(event.target)) {
          settingsDropdown.style.opacity = "0";
          settingsDropdown.style.transform = "translateY(10px)";
          setTimeout(() => {
              settingsDropdown.classList.add("hidden");
          }, 300);
      }
  });
  
  // Keyboard accessibility
  settingsToggle.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleDropdown(event);
      } else if (event.key === "Escape" && !settingsDropdown.classList.contains("hidden")) {
          settingsDropdown.classList.add("hidden");
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