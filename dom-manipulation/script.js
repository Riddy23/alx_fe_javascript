/* =========================
   Dynamic Quote Generator
   - LocalStorage persistence
   - JSON import/export
   - Category filter (persisted)
   ========================= */

const LS_QUOTES_KEY = "dqg_quotes_v2";
const LS_FILTER_KEY = "dqg_last_filter_v2";

/* Seed data */
const DEFAULT_QUOTES = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
];

let quotes = [];

/* ---------- Storage helpers ---------- */
function saveQuotes() {
  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_QUOTES_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    quotes = Array.isArray(parsed) ? parsed.filter(isValidQuote) : DEFAULT_QUOTES.slice();
  } catch {
    quotes = DEFAULT_QUOTES.slice();
  }
  saveQuotes();
}

function saveLastFilter(val) {
  localStorage.setItem(LS_FILTER_KEY, val);
}

function loadLastFilter() {
  return localStorage.getItem(LS_FILTER_KEY) || "all";
}

/* ---------- Validation ---------- */
function isValidQuote(q) {
  return q && typeof q.text === "string" && q.text.trim() &&
         typeof q.category === "string" && q.category.trim();
}

/* ---------- DOM references ---------- */
const quotesList = document.getElementById("quotesList");
const categoryFilter = document.getElementById("categoryFilter");
const quoteForm = document.getElementById("quoteForm");
const quoteText = document.getElementById("quoteText");
const quoteCategory = document.getElementById("quoteCategory");

/* ---------- Rendering ---------- */
function renderQuotes(list) {
  quotesList.innerHTML = "";
  if (!list.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No quotes to display.";
    quotesList.appendChild(li);
    return;
  }

  list.forEach(q => {
    const li = document.createElement("li");

    const content = document.createElement("div");
    content.className = "quote-text";
    content.innerHTML = `“${escapeHTML(q.text)}”`;

    const metaWrap = document.createElement("div");
    metaWrap.className = "quote-meta";
    metaWrap.innerHTML = `<span class="badge">${escapeHTML(q.category)}</span>`;

    li.appendChild(content);
    li.appendChild(metaWrap);
    quotesList.appendChild(li);
  });
}

/* ---------- Filter UI ---------- */
function uniqueCategories() {
  return Array.from(new Set(quotes.map(q => q.category.trim()))).sort((a,b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
}

/* Step 2: Populate Categories Dynamically */
function populateCategories() {
  const current = categoryFilter.value || loadLastFilter() || "all";
  // reset options, keep "all"
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
  // restore last selection if exists, else fall back to "all"
  const exists = [...categoryFilter.options].some(o => o.value === current);
  categoryFilter.value = exists ? current : "all";
}

/* Step 2: Filter Quotes Based on Selected Category */
function filterQuotes() {
  const selected = categoryFilter.value;
  saveLastFilter(selected);
  const list = (selected === "all")
    ? quotes.slice()
    : quotes.filter(q => q.category === selected);
  renderQuotes(list);
}

/* Step 3: Update storage & dropdown when adding quotes */
function addQuote(e) {
  e.preventDefault();
  const text = quoteText.value.trim();
  const category = quoteCategory.value.trim();
  if (!text || !category) return;

  const newQuote = { text, category };
  if (!isValidQuote(newQuote)) return;

  quotes.push(newQuote);
  saveQuotes();

  // If it's a new category, dropdown will update here
  const before = new Set(uniqueCategories());
  populateCategories();
  const after = new Set(uniqueCategories());

  // If user is currently filtering by the new category, ensure it appears selected
  if (!before.has(category) && categoryFilter.value === "all") {
    // stay on "all"; otherwise let users opt-in
  }

  // re-apply current filter and rerender
  filterQuotes();

  quoteForm.reset();
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
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("File must contain an array of quotes.");
      const valid = imported.filter(isValidQuote);
      if (!valid.length) throw new Error("No valid quotes found in file.");

      // Merge (avoid duplicates by text+category)
      const sig = (q) => `${q.text}@@${q.category}`;
      const existing = new Set(quotes.map(sig));
      let added = 0;
      for (const q of valid) {
        const s = sig(q);
        if (!existing.has(s)) {
          quotes.push({ text: q.text, category: q.category });
          existing.add(s);
          added++;
        }
      }
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert(added ? `Imported ${added} quote(s).` : "No new quotes to import.");
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

/* ---------- Helpers ---------- */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ---------- Initialize ---------- */
(function init() {
  loadQuotes();
  populateCategories();

  // Restore last filter and render
  const last = loadLastFilter();
  if ([...categoryFilter.options].some(o => o.value === last)) {
    categoryFilter.value = last;
  } else {
    categoryFilter.value = "all";
  }
  filterQuotes();

  // Events
  quoteForm.addEventListener("submit", addQuote);

  // Expose for inline handlers
  window.filterQuotes = filterQuotes;
  window.populateCategories = populateCategories;
  window.importFromJsonFile = importFromJsonFile;
  window.exportToJsonFile = exportToJsonFile;
})();
