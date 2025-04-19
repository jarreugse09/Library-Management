document.addEventListener("DOMContentLoaded", () => {
    const settingsLink = document.getElementById("settingsLink");
    const settingsDropdown = document.getElementById("settingsDropdown");
  
    // Toggle dropdown visibility on click
    settingsLink.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default link behavior
      settingsDropdown.classList.toggle("hidden"); // Toggle the 'hidden' class
    });
  
    // Close the dropdown if clicked outside
    document.addEventListener("click", (event) => {
      if (!settingsLink.contains(event.target) && !settingsDropdown.contains(event.target)) {
        settingsDropdown.classList.add("hidden");
      }
    });
  });