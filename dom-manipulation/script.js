// ====================
// DOM ELEMENTS
// ====================
const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteForm = document.getElementById('addQuoteForm');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteAuthor = document.getElementById('newQuoteAuthor');
const newQuoteCategory = document.getElementById('newQuoteCategory');

// ====================
// STATE
// ====================
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "Life" }
];

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// ====================
// INITIALIZE
// ====================
populateCategories();
displayRandomQuote();

// ====================
// EVENT LISTENERS
// ====================
addQuoteForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = newQuoteText.value.trim();
    const author = newQuoteAuthor.value.trim() || "Unknown";
    const category = newQuoteCategory.value.trim() || "General";

    if (text === "") return;

    const newQuote = { text, author, category };
    quotes.push(newQuote);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    populateCategories();
    displayRandomQuote();
    newQuoteText.value = "";
    newQuoteAuthor.value = "";
    newQuoteCategory.value = "";

    // Sync with server
    postQuoteToServer(newQuote);
});

categoryFilter.addEventListener('change', () => {
    localStorage.setItem('selectedCategory', categoryFilter.value);
    displayRandomQuote();
});

// ====================
// FUNCTIONS
// ====================
function displayRandomQuote() {
    const selectedCategory = categoryFilter.value || localStorage.getItem('selectedCategory') || "all";
    const filtered = selectedCategory === "all"
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

    if (filtered.length === 0) {
        quoteDisplay.textContent = "No quotes in this category.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filtered.length);
    const { text, author } = filtered[randomIndex];
    quoteDisplay.textContent = `"${text}" - ${author}`;
}

function populateCategories() {
    const categories = ["all", ...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = categories
        .map(cat => `<option value="${cat}">${cat}</option>`)
        .join("");
    categoryFilter.value = localStorage.getItem('selectedCategory') || "all";
}

async function postQuoteToServer(quote) {
    try {
        const response = await fetch(SERVER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(quote)
        });
        const data = await response.json();
        console.log("Quote synced with server:", data);
    } catch (error) {
        console.error("Error posting quote:", error);
    }
}

async function fetchQuotesFromServer() {
    try {
        const res = await fetch(SERVER_URL);
        const serverData = await res.json();
        const serverQuotes = serverData.slice(0, 5).map(post => ({
            text: post.title,
            author: `User ${post.userId}`,
            category: "Server"
        }));

        // Conflict resolution: server quotes overwrite if new
        let updated = false;
        serverQuotes.forEach(sq => {
            if (!quotes.some(lq => lq.text === sq.text)) {
                quotes.push(sq);
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem('quotes', JSON.stringify(quotes));
            populateCategories();
            displayRandomQuote();
            console.log("Quotes updated from server");
        }

    } catch (error) {
        console.error("Error fetching server quotes:", error);
    }
}

// ====================
// AUTO SYNC EVERY 15s
// ====================
setInterval(fetchQuotesFromServer, 15000);
