// Initial quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");

// Initialize category dropdown
function populateCategories() {
  // Get unique categories
  const categories = [...new Set(quotes.map(q => q.category))];
  
  // Clear existing options
  categorySelect.innerHTML = "";
  
  // Add category options
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// Show a random quote based on selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  
  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    quoteDisplay.textContent = filteredQuotes[randomIndex].text;
  } else {
    quoteDisplay.textContent = "No quotes available for this category.";
  }
}

// Add a new quote
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    newQuoteText.value = "";
    newQuoteCategory.value = "";

    populateCategories();
    alert("Quote added successfully!");
  } else {
    alert("Please fill in both fields.");
  }
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Initialize app
populateCategories();
