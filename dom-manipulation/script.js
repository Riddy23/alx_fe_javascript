let quotes = [];

// Load from localStorage
window.onload = function() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
    renderQuotes();
  }
};

// Add Quote
document.getElementById("quoteForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const text = document.getElementById("quoteText").value.trim();
  const author = document.getElementById("quoteAuthor").value.trim();

  if (text && author) {
    quotes.push({ text, author });
    localStorage.setItem("quotes", JSON.stringify(quotes));
    renderQuotes();
    this.reset();
  }
});

// Render Quotes
function renderQuotes() {
  const list = document.getElementById("quotesList");
  list.innerHTML = "";
  quotes.forEach((q, index) => {
    const li = document.createElement("li");
    li.textContent = `"${q.text}" — ${q.author}`;
    list.appendChild(li);
  });
}

// Export Quotes
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Import Quotes
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes = imported;
        localStorage.setItem("quotes", JSON.stringify(quotes));
        renderQuotes();
      }
    } catch (err) {
      alert("Invalid JSON file");
    }
  };
  reader.readAsText(file);
}
