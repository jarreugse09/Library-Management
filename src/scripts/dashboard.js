document.addEventListener("DOMContentLoaded", () => {
  const toggleMode = document.getElementById("toggleMode");

  // Check if user has a preference
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
  }

  toggleMode.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    // Save user preference
    if (document.body.classList.contains("light-mode")) {
      localStorage.setItem("theme", "light");
    } else {
      localStorage.setItem("theme", "dark");
    }
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user = await getUserData();
    if (!user) {
      alert("User not authenticated!");
      window.location.href = "/";
      return;
    }

    document.getElementById("username").textContent = user.username;
    document.getElementById("role").textContent = user.role;

    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("token");
      alert("Logged out!");
      window.location.href = "/";
    });

    applyRoleRestrictions(user.role);
    fetchUsers();
    fetchPosts();
  } catch (error) {
    console.error("Error loading user data:", error);
  }
});

function applyRoleRestrictions(role) {
  if (["user", "reactor", "commenter"].includes(role)) {
    document.getElementById("createPostSection").style.display = "none";
  }

  if (["user", "reactor"].includes(role)) {
    document
      .getElementById("postsContainer")
      .classList.add("disable-likes-comments");
  }
}

async function showManageUsers() {
  const user = await getUserData();
  const manageUsersSection = document.querySelector(".manage-users");

  if (!user || user.role !== "admin") {
    manageUsersSection.style.display = "none";
  } else {
    manageUsersSection.style.display = "block";
  }
}

showManageUsers();

async function getUserData() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to fetch user data");
    return await response.json();
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

// Fetch and display users
async function fetchUsers() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const user = await getUserData();
    if (!user) return;

    const response = await fetch("/api/users", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to fetch users");

    const users = await response.json();
    const filteredUsers = users.filter((u) => u.username !== user.username);
    displayUsers(filteredUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

function displayUsers(users) {
  const usersList = document.getElementById("usersList");
  usersList.innerHTML = "";

  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <span>${user.username}</span>
            <select class="role-select" data-username="${user.username}">
                <option value="admin" ${
                  user.role === "admin" ? "selected" : ""
                }>Admin</option>
                <option value="poster" ${
                  user.role === "poster" ? "selected" : ""
                }>Poster</option>
                <option value="commenter" ${
                  user.role === "commenter" ? "selected" : ""
                }>Commenter</option>
                <option value="reactor" ${
                  user.role === "reactor" ? "selected" : ""
                }>Reactor</option>
                <option value="user" ${
                  user.role === "user" ? "selected" : ""
                }>User</option>
            </select>
        `;
    usersList.appendChild(li);
  });

  document.querySelectorAll(".role-select").forEach((select) => {
    select.addEventListener("change", async (event) => {
      const username = event.target.dataset.username;
      const newRole = event.target.value;
      await updateUserRole(username, newRole);
    });
  });
}

async function updateUserRole(username, role) {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch("/api/users/assign-role", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username, role }),
    });

    if (!response.ok) throw new Error("Failed to update role");

    alert(`Role updated: ${username} is now a ${role}`);
  } catch (error) {
    console.error("Error updating role:", error);
  }
}

// Create Post Functionality
document.addEventListener("DOMContentLoaded", () => {
  const submitPostButton = document.getElementById("submitPost");
  if (submitPostButton) {
    submitPostButton.addEventListener("click", async () => {
      const title = document.getElementById("postTitle").value;
      const description = document.getElementById("postDescription").value;
      const image = document.getElementById("postImage").files[0];
      console.log(title);
      console.log(description);

      // Validate title and description
      if (!title || !description) {
        alert("Title and description are required!");
        return;
      }

      console.log("Title:", title);
      console.log("Description:", description);
      console.log("Image:", image);

      // Prepare form data as a JSON object
      const postData = {
        title,
        description,
        image: image ? await convertToBase64(image) : null, // Convert image to base64 if present
      };
      console.log(postData);

      const token = localStorage.getItem("token");
      try {
        const response = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(postData), // Send the JSON object as string
        });

        if (response.ok) {
          const newPost = await response.json();
          displayPost(newPost); // Assuming you have a function to display posts
          alert("Post created successfully!");
        } else {
          const error = await response.json();
          alert(error.error || "Error creating post");
        }
      } catch (error) {
        console.error("Error posting data:", error);
      }
    });
  } else {
    console.error("Submit post button not found.");
  }
});

// Function to convert an image to base64
async function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// Fetch and Display Posts
async function fetchPosts() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch("/api/books/physical", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to fetch books");
    const books = await response.json();

    // Convert books to posts format
    const posts = books.map((book, index) => ({
      id: book._id || index,
      title: book.title || "Untitled",
      description:
        book.description || book.summary || "No description available",
      image: book.coverImage ? `/uploads/covers/${book.coverImage}` : null,
      username: book.donor || "Library",
      likes: 0,
      comments: [],
      author: book.author || "Unknown Author",
      isbn: book.isbn,
      genre: book.genre,
      condition: book.condition,
      availability: book.availability,
    }));

    displayPosts(posts);
  } catch (error) {
    console.error("Error fetching books:", error);
    displayPosts([]);
  }
}

async function displayPosts(posts) {
  const postsContainer = document.getElementById("postsContainer");
  const user = await getUserData();
  if (!user) return;

  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    if (!Array.isArray(post.comments)) post.comments = [];

    const postElement = document.createElement("div");
    postElement.classList.add("post");

    // Add click handler to show rating/review UI
    postElement.addEventListener("click", (e) => {
      // Don't trigger if clicking on buttons or inputs
      if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT") {
        return;
      }
      showPostDetail(post, user);
    });

    let likeButton =
      user.role !== "user"
        ? `<button onclick="event.stopPropagation(); likePost(${post.id})">👍<span class="like-count" id="likes-${post.id}">${post.likes}</span></button>`
        : "";
    let commentSection =
      user.role !== "user" && user.role !== "reactor"
        ? `
            <input type="text" id="comment-input-${post.id}" placeholder="Write a comment..." onclick="event.stopPropagation()">
            <button onclick="event.stopPropagation(); addComment(${post.id})">Post</button>
        `
        : "";
    let deleteButton =
      user.role === "admin" ||
      (user.role === "poster" && post.username === user.username)
        ? `<button onclick="event.stopPropagation(); deletePost(${post.id})">🗑️</button>`
        : "";

    postElement.innerHTML = `
            ${
              post.image
                ? `<img src="${post.image}" alt="${post.title}" class="post-image">`
                : `<div class="post-no-image"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></div>`
            }
            <div class="post-content">
                <h4 class="post-title">${post.title}</h4>
                ${post.author ? `<p class="post-author">by ${post.author}</p>` : ""}
                <p class="post-description">${post.description}</p>
                ${post.genre ? `<span class="post-genre">${post.genre}</span>` : ""}
                ${post.condition ? `<span class="post-badge ${post.condition.toLowerCase()}">${post.condition}</span>` : ""}
                ${post.availability !== undefined ? `<span class="post-badge ${post.availability ? "available" : "unavailable"}">${post.availability ? "Available" : "Borrowed"}</span>` : ""}
            </div>
        `;

    postsContainer.appendChild(postElement);
  });
}

async function addComment(postId) {
  const user = await getUserData();
  console.log("User Data:", user);

  if (!user || user.role === "user" || user.role === "reactor") return;

  const commentInput = document.getElementById(`comment-input-${postId}`);
  if (!commentInput) {
    console.error("Comment input not found!");
    return;
  }

  const text = commentInput.value.trim();
  if (!text) return;

  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  console.log("All Posts:", posts);

  const postIndex = posts.findIndex((p) => p.id === parseInt(postId));
  if (postIndex === -1) {
    console.error("Post not found!");
    return;
  }

  if (!posts[postIndex].comments) posts[postIndex].comments = [];

  posts[postIndex].comments.push({
    id: Date.now(),
    username: user.username,
    text,
  });

  localStorage.setItem("posts", JSON.stringify(posts));
  commentInput.value = "";
  fetchPosts();
}

async function deleteComment(postId, commentId) {
  const user = await getUserData();
  if (
    !user ||
    user.role === "user" ||
    user.role === "reactor" ||
    user.role === "commenter"
  )
    return;

  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts.find((p) => p.id === parseInt(postId));
  if (!post) return;

  post.comments = post.comments.filter((c) => c.id !== parseInt(commentId));

  localStorage.setItem("posts", JSON.stringify(posts));
  fetchPosts();
}

function deletePost(postId) {
  const user = getUserData();
  if (
    !user ||
    user.role === "user" ||
    user.role === "reactor" ||
    user.role === "commenter"
  )
    return;

  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  posts = posts.filter((post) => post.id !== parseInt(postId));

  localStorage.setItem("posts", JSON.stringify(posts));
  fetchPosts();
}

function likePost(postId) {
  const user = getUserData();
  if (!user || user.role === "user" || user.role === "reactor") return;

  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  let postIndex = posts.findIndex((p) => p.id === parseInt(postId));

  if (postIndex !== -1) {
    let post = posts[postIndex];

    if (!post.likedBy) post.likedBy = []; // Ensure likedBy exists

    const userIndex = post.likedBy.indexOf(user.username);

    if (userIndex === -1) {
      post.likedBy.push(user.username);
      post.likes = (post.likes || 0) + 1;
    } else {
      post.likedBy.splice(userIndex, 1);
      post.likes = Math.max((post.likes || 0) - 1, 0);
    }

    posts[postIndex] = post; // Update the post in the array
    localStorage.setItem("posts", JSON.stringify(posts));
    fetchPosts();
  }
}

// Load posts when the page loads
document.addEventListener("DOMContentLoaded", fetchPosts);

// Toggle comments visibility
function toggleComments(postId) {
  const commentsSection = document.getElementById(`comments-section-${postId}`);
  const divider = commentsSection.previousElementSibling;

  if (commentsSection.style.display === "none") {
    commentsSection.style.display = "block";
    divider.style.display = "block";
  } else {
    commentsSection.style.display = "none";
    divider.style.display = "none";
  }
}

// Show post detail with rating/review UI
function showPostDetail(post, user) {
  const modal = document.createElement("div");
  modal.className = "post-detail-modal";
  modal.innerHTML = `
    <div class="post-detail-content">
      <button class="close-modal" onclick="this.parentElement.parentElement.remove()">✕</button>
      <h2>${post.title}</h2>
      <p class="post-author-detail">By: ${post.username}</p>
      <p class="post-description-detail">${post.description}</p>
      ${post.image ? `<img src="${post.image}" alt="Post Image" class="post-image-detail">` : ""}
      
      <div class="rating-section">
        <h3>Rate this post</h3>
        <div class="star-rating">
          ${[1, 2, 3, 4, 5]
            .map(
              (star) => `
            <span class="star" data-rating="${star}" onclick="ratePost(${post.id}, ${star})">★</span>
          `,
            )
            .join("")}
        </div>
        <p class="rating-display">Rating: ${post.rating || 0}/5</p>
      </div>
      
      <div class="review-section">
        <h3>Add a Review</h3>
        <textarea id="review-text-${post.id}" placeholder="Write your review here..." rows="4"></textarea>
        <button class="btn btn-primary" onclick="submitReview(${post.id})">Submit Review</button>
        
        <div class="reviews-list">
          <h4>Reviews</h4>
          ${
            (post.reviews || [])
              .map(
                (review) => `
            <div class="review-item">
              <strong>${review.username}</strong>
              <p>${review.text}</p>
            </div>
          `,
              )
              .join("") || "<p>No reviews yet.</p>"
          }
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Rate a post
function ratePost(postId, rating) {
  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  const postIndex = posts.findIndex((p) => p.id === parseInt(postId));

  if (postIndex !== -1) {
    posts[postIndex].rating = rating;
    localStorage.setItem("posts", JSON.stringify(posts));

    // Update UI
    document.querySelector(".rating-display").textContent =
      `Rating: ${rating}/5`;

    // Highlight stars
    document.querySelectorAll(".star").forEach((star, index) => {
      star.style.color = index < rating ? "gold" : "#666";
    });
  }
}

// Submit review
async function submitReview(postId) {
  const user = await getUserData();
  const reviewText = document
    .getElementById(`review-text-${postId}`)
    .value.trim();

  if (!reviewText) {
    alert("Please write a review");
    return;
  }

  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  const postIndex = posts.findIndex((p) => p.id === parseInt(postId));

  if (postIndex !== -1) {
    if (!posts[postIndex].reviews) posts[postIndex].reviews = [];

    posts[postIndex].reviews.push({
      username: user.username,
      text: reviewText,
      date: new Date().toISOString(),
    });

    localStorage.setItem("posts", JSON.stringify(posts));
    alert("Review submitted!");

    // Close modal and refresh
    document.querySelector(".post-detail-modal").remove();
    fetchPosts();
  }
}
