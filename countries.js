// Elements
const countryInput = document.getElementById("countryInput");
const searchBtn = document.getElementById("searchBtn");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const resultDiv = document.getElementById("result");
const themeBtn = document.getElementById("themeToggle");

const compareArea = document.getElementById("compareArea");
const compareRunBtn = document.getElementById("compareRun");
const clearCompareBtn = document.getElementById("clearCompare");
const compareResults = document.getElementById("compareResults");

const compareState = [];

// Hide compare area initially
compareArea.style.display = "none";

// Dark mode toggle
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Loading toggle
function toggleLoading(show) {
  loadingEl.classList.toggle("hidden", !show);
}

// Display country card
function displayCountry(country) {
  const card = document.createElement("div");
  card.className = "country-card";

  const isSelected = compareState.some(c => c.cca3 === country.cca3);

  card.innerHTML = `
    <h3>${country.name.common}</h3>
    <img src="${country.flags.png}" alt="Flag of ${country.name.common}">
    <p><strong>Capital:</strong> ${country.capital?.[0] || "N/A"}</p>
    <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
    <p><strong>Region:</strong> ${country.region}</p>
    <button class="add-compare ${isSelected ? "selected" : ""}">
      ${isSelected ? "Selected" : "Add to compare"}
    </button>
  `;

  resultDiv.appendChild(card);

  const addBtn = card.querySelector(".add-compare");
  addBtn.addEventListener("click", () => toggleCompare(country, addBtn));
}

// Search
searchBtn.addEventListener("click", async () => {
  const name = countryInput.value.trim();
  errorEl.textContent = "";
  resultDiv.innerHTML = "";

  if (!name) {
    errorEl.textContent = "Please enter a country name";
    compareArea.style.display = "none";
    return;
  }

  toggleLoading(true);

  try {
    const res = await fetch(`https://restcountries.com/v3.1/name/${name}`);
    if (!res.ok) throw new Error("No results found");

    const data = await res.json();
    compareArea.style.display = "block";
    data.forEach(displayCountry);
  } catch (err) {
    errorEl.textContent = err.message;
    compareArea.style.display = "none";
  } finally {
    toggleLoading(false);
  }
});

// Toggle compare
function toggleCompare(country, btn) {
  const index = compareState.findIndex(c => c.cca3 === country.cca3);

  if (index !== -1) {
    compareState.splice(index, 1);
    btn.classList.remove("selected");
    btn.textContent = "Add to compare";
  } else {
    if (compareState.length >= 2) {
      alert("You can compare only two countries at a time");
      return;
    }
    compareState.push(country);
    btn.classList.add("selected");
    btn.textContent = "Selected";
  }

  updateCompareUI();
}

// Update compare UI
function updateCompareUI() {
  compareRunBtn.textContent = `Compare (${compareState.length}/2)`;
  compareRunBtn.disabled = compareState.length !== 2;

  if (compareState.length < 2) {
    compareResults.innerHTML = "";
  }
}

// Render comparison (FULL DETAILS — FLAG, CAPITAL, POPULATION, REGION)
compareRunBtn.addEventListener("click", () => {
  if (compareState.length !== 2) return;

  const [a, b] = compareState;

  compareResults.innerHTML = `
    <div class="compare-card">
      <h4>${a.name.common}</h4>
      <img src="${a.flags.png}" alt="Flag of ${a.name.common}">
      <p><strong>Capital:</strong> ${a.capital?.[0] || "N/A"}</p>
      <p><strong>Population:</strong> ${a.population.toLocaleString()}</p>
      <p><strong>Region:</strong> ${a.region}</p>
    </div>

    <div class="compare-card">
      <h4>${b.name.common}</h4>
      <img src="${b.flags.png}" alt="Flag of ${b.name.common}">
      <p><strong>Capital:</strong> ${b.capital?.[0] || "N/A"}</p>
      <p><strong>Population:</strong> ${b.population.toLocaleString()}</p>
      <p><strong>Region:</strong> ${b.region}</p>
    </div>
  `;
});

// Clear compare
clearCompareBtn.addEventListener("click", () => {
  compareState.length = 0;
  compareResults.innerHTML = "";
  updateCompareUI();

  document.querySelectorAll(".add-compare").forEach(btn => {
    btn.classList.remove("selected");
    btn.textContent = "Add to compare";
  });
});
