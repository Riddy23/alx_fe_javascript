// ====================
// DOM ELEMENTS
// ====================
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteInput = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const notificationBar = document.getElementById('notification');

// ====================
// LOCAL STORAGE & STATE
// ====================
let localQuotes = JSON.parse(localStorage.getItem('quotes')) || [
    "The best way to predict the future is to invent it.",
    "Simplicity is the soul of efficiency.",
    "Code is like humor. When you have to explain it, it’s bad."
];
let lastSyncTime = localStorage.getItem('lastSyncTime') || null;

// ====================
// SERVER SIMULATION
// ====================
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// ====================
// RESPONSIVE MENU TOGGLE
// ====================
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('toggle');
});

// ====================
// QUOTE GENERATION
// ====================
function showRandomQuote() {
    if (localQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available.";
        return;
    }
    const randomIndex = Math.floor(Math.random() * localQuotes.length);
    quoteDisplay.textContent = localQuotes[randomIndex];
}

// ====================
// ADDING QUOTES
// ====================
function addQuote() {
    const newQuote = newQuoteInput.value.trim();
    if (newQuote) {
        localQuotes.push(newQuote);
        localStorage.setItem('quotes', JSON.stringify(localQuotes));
        newQuoteInput.value = '';
        showRandomQuote();
        syncWithServer(newQuote);
    }
}

// ====================
// SERVER SYNC LOGIC
// ====================
async function syncWithServer(newQuote = null) {
    try {
        if (newQuote) {
            await fetch(SERVER_URL, {
                method: 'POST',
                body: JSON.stringify({ title: 'quote', body: newQuote }),
                headers: { 'Content-type': 'application/json; charset=UTF-8' }
            });
        }

        const res = await fetch(SERVER_URL);
        const serverData = await res.json();

        // Simulate quotes from server data
        const serverQuotes = serverData.slice(0, 5).map(post => post.body);

        // Conflict resolution: server wins
        const mergedQuotes = Array.from(new Set([...serverQuotes, ...localQuotes]));
        if (JSON.stringify(mergedQuotes) !== JSON.stringify(localQuotes)) {
            localQuotes = mergedQuotes;
            localStorage.setItem('quotes', JSON.stringify(localQuotes));
            notifyUser("Quotes updated from server (server data took precedence).");
        }

        lastSyncTime = new Date().toISOString();
        localStorage.setItem('lastSyncTime', lastSyncTime);

    } catch (error) {
        console.error("Error syncing with server:", error);
    }
}

// ====================
// NOTIFICATION
// ====================
function notifyUser(message) {
    if (!notificationBar) return;
    notificationBar.textContent = message;
    notificationBar.style.display = 'block';
    setTimeout(() => {
        notificationBar.style.display = 'none';
    }, 3000);
}

// ====================
// EVENT LISTENERS
// ====================
addQuoteBtn.addEventListener('click', addQuote);
document.getElementById('newQuoteBtn')?.addEventListener('click', showRandomQuote);

// ====================
// INITIAL LOAD & SYNC
// ====================
showRandomQuote();
syncWithServer();
setInterval(syncWithServer, 15000); // Sync every 15 seconds
