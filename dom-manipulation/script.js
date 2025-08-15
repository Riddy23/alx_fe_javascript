// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteForm = document.getElementById('addQuoteForm');
const quoteInput = document.getElementById('quoteInput');
const authorInput = document.getElementById('authorInput');
const categoryInput = document.getElementById('categoryInput');

// Default quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The best way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "Motivation" },
    { text: "Don't let yesterday take up too much of today.", author: "Will Rogers", category: "Inspiration" },
    { text: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi", category: "Resilience" }
];

// Display a random quote
function displayRandomQuote() {
    const filteredQuotes = getFilteredQuotes();
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = "<p>No quotes available for this category.</p>";
        return;
    }
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    quoteDisplay.innerHTML = `
        <p>"${randomQuote.text}"</p>
        <p>- ${randomQuote.author}</p>
        <small><em>Category: ${randomQuote.category}</em></small>
    `;
}

// Populate category dropdown dynamically
function populateCategories() {
    const categories = ["all", ...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = "";
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        categoryFilter.appendChild(option);
    });

    // Restore last selected category
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory && categories.includes(savedCategory)) {
        categoryFilter.value = savedCategory;
    }
}

// Get quotes based on current filter
function getFilteredQuotes() {
    const selectedCategory = categoryFilter.value;
    if (selectedCategory === "all") {
        return quotes;
    }
    return quotes.filter(q => q.category === selectedCategory);
}

// Filter quotes when category changes
function filterQuotes() {
    localStorage.setItem('selectedCategory', categoryFilter.value);
    displayRandomQuote();
}

// Add new quote
function addQuote(e) {
    e.preventDefault();
    const newQuote = {
        text: quoteInput.value.trim(),
        author: authorInput.value.trim() || "Unknown",
        category: categoryInput.value.trim() || "General"
    };
    if (newQuote.text === "") return;

    quotes.push(newQuote);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    populateCategories();
    displayRandomQuote();

    addQuoteForm.reset();
}

// Event listeners
categoryFilter.addEventListener('change', filterQuotes);
addQuoteForm.addEventListener('submit', addQuote);

// Initialize
populateCategories();
displayRandomQuote();
