// ====== CONFIG ======
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock server endpoint
const SYNC_INTERVAL = 10000; // 10 seconds

// ====== STATE ======
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker", updatedAt: Date.now() },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", updatedAt: Date.now() }
];

// ====== DOM ELEMENTS ======
const quoteDisplay = document.getElementById("quoteDisplay");
const authorDisplay = document.getElementById("authorDisplay");
const addQuoteForm = document.getElementById("addQuoteForm");
const exportBtn = document.getElementById("exportQuotes");

// ====== INITIAL RENDER ======
displayRandomQuote();

// ====== EVENT LISTENERS ======
addQuoteForm.addEventListener("submit", e => {
    e.preventDefault();
    const text = document.getElementById("quoteText").value.trim();
    const author = document.getElementById("quoteAuthor").value.trim();

    if (text && author) {
        const newQuote = { text, author, updatedAt: Date.now() };
        quotes.push(newQuote);
        localStorage.setItem("quotes", JSON.stringify(quotes));
        displayRandomQuote();
        addQuoteForm.reset();
        alert("Quote added!");
    }
});

exportBtn.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quotes, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "quotes.json");
    downloadAnchor.click();
});

// ====== FUNCTIONS ======
function displayRandomQuote() {
    if (quotes.length === 0) return;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const { text, author } = quotes[randomIndex];
    quoteDisplay.textContent = `"${text}"`;
    authorDisplay.textContent = `- ${author}`;
}

async function fetchQuotesFromServer() {
    try {
        const res = await fetch(SERVER_URL);
        const serverData = await res.json();

        // Simulate server quotes structure
        const serverQuotes = serverData.slice(0, 5).map(post => ({
            text: post.title,
            author: `User ${post.userId}`,
            updatedAt: Date.now() // pretend server always updates
        }));

        resolveConflicts(serverQuotes);
    } catch (error) {
        console.error("Error fetching from server:", error);
    }
}

function resolveConflicts(serverQuotes) {
    let updated = false;

    serverQuotes.forEach(serverQuote => {
        const localQuote = quotes.find(q => q.text === serverQuote.text);
        if (!localQuote) {
            quotes.push(serverQuote);
            updated = true;
        } else if (serverQuote.updatedAt > localQuote.updatedAt) {
            Object.assign(localQuote, serverQuote);
            updated = true;
        }
    });

    if (updated) {
        localStorage.setItem("quotes", JSON.stringify(quotes));
        notifyUser("Quotes updated from server!");
        displayRandomQuote();
    }
}

function notifyUser(message) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.position = "fixed";
    notification.style.bottom = "10px";
    notification.style.right = "10px";
    notification.style.background = "#222";
    notification.style.color = "#fff";
    notification.style.padding = "10px";
    notification.style.borderRadius = "5px";
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}

// ====== SYNC LOOP ======
setInterval(fetchQuotesFromServer, SYNC_INTERVAL);
