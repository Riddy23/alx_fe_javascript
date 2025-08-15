/* ========= Dynamic Quote Generator with Web Storage & JSON ========= */

/* Storage keys */
const LS_KEY = "dqg_quotes_v1";
const SS_KEY = "dqg_last_quote_v1";

/* Defaults (used when localStorage is empty or invalid) */
const DEFAULT_QUOTES = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" }
];

/* App state */
let quotes = [];

/* DOM refs (filled on init) */
let quoteDisplay, newQuoteBtn, categorySelect;

/* ---------- Storage helpers ---------- */
function saveQuotes() {
  localStorage.setItem(LS_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) {
      quotes = parsed.filter(isValidQuote);
    } else {
      quotes = DEFAULT_QUOTES.slice();
      saveQuotes();
    }
  } catch {
    quotes = DEFAULT_QUOTES.slice();
    saveQuotes();
  }
}

function saveLastViewedQuote(q) {
  try {
    sessionStorage.setItem(SS_KEY, JSON.stringify(q));
  } catch {}
}

function getLastViewedQuote() {
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ---------- Validation & utils ---------- */
function isValidQuote(obj) {
  return obj && typeof obj.text === "string" && obj.text.trim() !== "" &&
         typeof obj.category === "string" && obj.category.trim() !== "";
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function uniqueCategories() {
  return Array.from(new Set(quotes.map(q => q.category).filter(Boolean))).sort();
}

/* ---------- UI builders (DOM injection) ---------- */
function ensureControlsRow() {
  // Insert a compact controls row (Category select + Import/Export + Clear)
  const h1 = document.querySelector("h1");
  let controls = document.getElementById("controlsRow");
  if (!controls) {
    controls = document.createElement("div");
    controls.id = "controlsRow";
    controls.style.margin = "10px 0";
    controls.style.display = "flex";
    controls.style.flexWrap = "wrap";
    controls.style.gap = "8px";
    controls.style.justifyContent = "center";
    h1.insertAdjacentElement("afterend", controls);
  }

  // Category label + select
  let label = document.getElementById("categoryLabel");
  if (!label) {
    label = document.createElement("label");
    label.id = "categoryLabel";
    label.textContent = "Category: ";
    label.style.fontWeight = "600";
    controls.appendChild(label);
  }

  if (!categorySelect) {
    categorySelect = document.createElement("select");
    categorySelect.id = "categorySelect";
    categorySelect.style.padding = "6px";
    controls.appendChild(categorySelect);
  }

  // Export button
  if (!document.getElementById("exportBtn")) {
    const exportBtn = document.createElement("button");
    exportBtn.id = "exportBtn";
    exportBtn.textContent = "Export JSON";
    exportBtn.addEventListener("click", exportToJsonFile);
    controls.appendChild(exportBtn);
  }

  // Import file input
  if (!document.getElementById("importFile")) {
    const file = document.createElement("input");
    file.type = "file";
    file.id = "importFile";
    file.accept = ".json";
    file.addEventListener("change", importFromJsonFile);
    controls.appendChild(file);
  }

  // Clear all quotes (optional helper)
  if (!document.getElementById("clearBtn")) {
    const clearBtn = document.createElement("button");
    clearBtn.id = "clearBtn";
    clearBtn.textContent = "Clear All Quotes";
    clearBtn.addEventListener("click", () => {
      if (confirm("This will reset to default quotes. Continue?")) {
        quotes = DEFAULT_QUOTES.slice();
        saveQuotes();
        populateCategories();
        const last = getLastViewedQuote();
        renderQuote(last || quotes[0]);
      }
    });
    controls.appendChild(clearBtn);
  }
}

function createAddQuoteForm() {
  // Form container
  const formContainer = document.createElement("div");
  formContainer.id = "addQuoteForm";
  formContainer.style.marginTop = "16px";

  const title = document.createElement("h3");
  title.textContent = "Add a New Quote";
  formContainer.appendChild(title);

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";
  quoteInput.style.padding = "8px";
  quoteInput.style.margin = "5px";
  quoteInput.style.minWidth = "260px";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.style.padding = "8px";
  categoryInput.style.margin = "5px";
  categoryInput.style.minWidth = "180px";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.style.margin = "5px";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

function populateCategories() {
  if (!categorySelect) return;
  const current = categorySelect.value || "All";
  categorySelect.innerHTML = "";

  const allOpt = document.createElement("option");
  allOpt.value = "All";
  allOpt.textContent = "All";
  categorySelect.appendChild(allOpt);

  uniqueCategories().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  // Try to preserve previous selection
  if ([...categorySelect.options].some(o => o.value === current)) {
    categorySelect.value = current;
  } else {
    categorySelect.value = "All";
  }
}

/* ---------- Rendering & actions ---------- */
function renderQuote(q) {
  if (!q) {
    quoteDisplay.innerHTML = `<p>No quotes available.</p>`;
    return;
  }
  quoteDisplay.innerHTML = `<p>"${escapeHTML(q.text)}"</p><em>— ${escapeHTML(q.category)}</em>`;
}

function showRandomQuote() {
  const cat = categorySelect ? categorySelect.value : "All";
  const pool = (cat && cat !== "All") ? quotes.filter(q => q.category === cat) : quotes.slice();
  if (pool.length === 0) {
    renderQuote(null);
    return;
  }
  const random = pool[Math.floor(Math.random() * pool.length)];
  renderQuote(random);
  saveLastViewedQuote(random); // session-based preference
}

function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl = document.getElementById("newQuoteCategory");
  const text = textEl.value.trim();
  const category = catEl.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQ = { text, category };
  if (!isValidQuote(newQ)) {
    alert("Invalid quote format.");
    return;
  }

  quotes.push(newQ);
  saveQuotes();
  populateCategories();

  // Clear inputs & give feedback
  textEl.value = "";
  catEl.value = "";
  alert("Quote added successfully!");
}

/* ---------- Import / Export ---------- */
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("JSON must be an array of quotes.");

      // Validate & merge (skip obvious duplicates by text+category)
      const existingSet = new Set(quotes.map(q => `${q.text}@@${q.category}`));
      let added = 0;

      for (const q of imported) {
        if (isValidQuote(q)) {
          const sig = `${q.text}@@${q.category}`;
          if (!existingSet.has(sig)) {
            quotes.push({ text: q.text, category: q.category });
            existingSet.add(sig);
            added++;
          }
        }
      }

      saveQuotes();
      populateCategories();
      alert(added > 0 ? `Imported ${added} new quote(s).` : "No new quotes to import.");
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    } finally {
      // reset input so the same file can be selected again if needed
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // Base elements from the provided HTML
  quoteDisplay = document.getElementById("quoteDisplay");
  newQuoteBtn = document.getElementById("newQuote");

  // Load quotes and build UI
  loadQuotes();
  ensureControlsRow();
  populateCategories();
  createAddQuoteForm();

  // Show last viewed (session) or a random quote once
  const last = getLastViewedQuote();
  if (last && isValidQuote(last)) {
    renderQuote(last);
    // try to set category to last viewed
    if (categorySelect && uniqueCategories().includes(last.category)) {
      categorySelect.value = last.category;
    }
  } else {
    showRandomQuote();
  }

  // Events
  newQuoteBtn.addEventListener("click", showRandomQuote);
  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      // Show a quote matching the newly selected category
      showRandomQuote();
    });
  }
});

/* ---------- Expose (optional: for inline handlers/tests) ---------- */
window.saveQuotes = saveQuotes;
window.showRandomQuote = showRandomQuote;
window.createAddQuoteForm = createAddQuoteForm;
window.importFromJsonFile = importFromJsonFile;
window.exportToJsonFile = exportToJsonFile;
