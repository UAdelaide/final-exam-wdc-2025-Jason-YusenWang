var posts = [];
var search = null;

/*
 * Hide main content and show ask section
 */
function showAsk() {
    var main = document.getElementById("main");
    var ask = document.getElementById("ask");
    main.style.display = "none";
    ask.style.display = "block";
}

/*
 * Hide ask section, reset inputs, and return to main content
 */
function showMain() {
    var main = document.getElementById("main");
    var ask = document.getElementById("ask");
    ask.style.display = "none";
    main.style.display = "block";

    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    document.getElementById('post-tags').value = '';
}

/*
 * Send new post data to server and refresh the post list
 */
function createPost() {
    search = null;

    let post = {
        title: document.getElementById('post-title').value,
        content: document.getElementById('post-content').value,
        tags: document.getElementById('post-tags').value.split(" "),
        upvotes: 0
    };

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            loadPosts();
            showMain();
        }
    };

    xmlhttp.open("POST", "/addpost", true);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send(JSON.stringify(post));
}

/*
 * Update current search keyword and refresh displayed posts
 */
function searchPosts() {
    search = document.getElementById('post-search').value.toUpperCase();
    updatePosts();
}

/*
 * Render all visible posts to the page based on search term
 */
function updatePosts() {
    document.getElementById('post-list').innerHTML = '';

    for (let i = 0; i < posts.length; i++) {
        let post = posts[i];

        if (search !== null) {
            if (
                post.title.toUpperCase().indexOf(search) < 0
                && post.content.toUpperCase().indexOf(search) < 0
            ) {
                continue;
            }
        }

        let tagSpans = '';
        for (let tag of post.tags) {
            tagSpans += `<span class="tag">${tag}</span>`;
        }

        let postDiv = document.createElement("DIV");
        postDiv.classList.add("post");

        postDiv.innerHTML = `
            <div class="votes">
                <button onclick="upvote(${i})">+</button>
                <p><span class="count">${post.upvotes}</span><br />votes</p>
                <button onclick="downvote(${i})">-</button>
            </div>
            <div class="content">
                <h3><a href="#">${post.title}</a></h3>
                <i>By ${post.author}</i>
                <p>${post.content}</p>
                ${tagSpans}<span class="date">${new Date(post.timestamp).toLocaleString()}</span>
            </div>
        `;

        document.getElementById("post-list").appendChild(postDiv);
    }
}

/*
 * Load posts from the server and refresh page
 */
function loadPosts() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            posts = JSON.parse(this.responseText);
            updatePosts();
        }
    };

    xmlhttp.open("GET", "/posts", true);
    xmlhttp.send();
}

/*
 * Increase upvote count of a post
 */
function upvote(index) {
    posts[index].upvotes++;
    updatePosts();
}

/*
 * Decrease upvote count of a post
 */
function downvote(index) {
    posts[index].upvotes--;
    updatePosts();
}

/*
 * Submit login request with username and password
 */
function login() {
    let user = {
        user: document.getElementById('username').value,
        pass: document.getElementById('password').value
    };

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            alert("Welcome " + this.responseText);
        } else if (this.readyState === 4 && this.status >= 400) {
            alert("Login failed");
        }
    };

    xmlhttp.open("POST", "/users/login", true);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send(JSON.stringify(user));
}

/*
 * Send logout request to server
 */
function logout() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/users/logout", true);
    xmlhttp.send();
}

/*
 * === Task 15: Fetch user's dogs and populate dropdown ===
 */
function loadDogsForOwner() {
    const dogDropdown = document.getElementById('dog-id-select');
    if (!dogDropdown) return;

    fetch('/api/dogs/mine')
        .then((res) => res.json())
        .then((dogs) => {
            dogDropdown.innerHTML = '<option value="">-- Choose a dog --</option>';
            dogs.forEach((dog) => {
                const opt = document.createElement('option');
                opt.value = dog.dog_id;
                opt.textContent = dog.name;
                dogDropdown.appendChild(opt);
            });
        })
        .catch((err) => {
            console.error('Error fetching dog list:', err);
        });
}

// Call loadDogsForOwner when the page loads (if relevant)
window.addEventListener('DOMContentLoaded', () => {
    loadDogsForOwner();
});
