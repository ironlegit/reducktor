// TOGGLE DARK MODE FUNCTION
function toggleDarkMode() {
  // Trigger the CSS rules that change colors for dark mode
  document.body.classList.toggle("dark-mode");

  // Get the toggle button element
  const button = document.querySelector("#darkmode-btn");

  // Update button text based on current mode
  button.innerHTML = document.body.classList.contains("dark-mode")
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

// TOGGLE SIDE PANEL
function togglePanel() {
  const panel = document.querySelector(".side-panel");
  const backdrop = document.querySelector(".panel-backdrop");
  const isOpening = !panel.classList.contains("active");

  panel.classList.toggle("active");
  backdrop.classList.toggle("active");

  if (isOpening) {
    panel.querySelector(".close-btn").focus();
    document.addEventListener("keydown", closeOnEscape);
  } else {
    document.removeEventListener("keydown", closeOnEscape);
  }
}

function closeOnEscape(e) {
  if (e.key === "Escape") togglePanel();
}

// CLIPBOARD TOGGLE IN / OUT
function switchToOut() {
  document.getElementById("clipboardIn").style.display = "none";
  document.getElementById("clipboardOut").style.display = "block";
  document.getElementById("tabIn").classList.remove("active");
  document.getElementById("tabOut").classList.add("active");
}

function switchToIn() {
  document.getElementById("clipboardIn").style.display = "block";
  document.getElementById("clipboardOut").style.display = "none";
  document.getElementById("tabOut").classList.remove("active");
  document.getElementById("tabIn").classList.add("active");
}

// Flush button
// TODO: Make a little animation so that its clear something happened!
async function flushButtonAction() {
  const btn = document.getElementById("flushBtn");
  btn.innerHTML = '<i class="fa-solid fa-check"></i>';
  flushOutput();
  switchToIn();
  setTimeout(() => (btn.innerHTML = '<i class="fas fa-trash-can"></i>'), 1500);
}

// COPY-PASTE BUTTON
async function copyClipboardContent() {
  const content = document.getElementById("clipboardOut").innerText;

  await navigator.clipboard.writeText(content);

  // Visual feedback
  const btn = document.getElementById("copyBtn");
  btn.innerHTML = '<i class="fa-solid fa-check"></i>';
  setTimeout(() => (btn.innerHTML = '<i class="fa-solid fa-copy"></i>'), 1500);
}

// REDACTION PLACEHOLDER TOGGLE LOGIC

// false is block style placeholder
let redactionPlaceholder = "false";

function toggleRedactionPlaceholder() {
  redactionPlaceholder = document.querySelector(
    'input[name="placeholderMode"]:checked',
  ).value;
}

const PLACEHOLDERS = {
  name: { labelled: "[REDACTED-NAME]", block: "█████" },
  date: { labelled: "[REDACTED-DATE]", block: "█████" },
  email: { labelled: "[REDACTED-EMAIL]", block: "█████" },
  phone: { labelled: "[REDACTED-PHONE]", block: "█████" },
  org: { labelled: "[REDACTED-ORG]", block: "█████" },
  place: { labelled: "[REDACTED-PLACE]", block: "█████" },
  custom: { labelled: "[REDACTED-WORD]", block: "█████" },
};

function getPlaceholder(type) {
  if (redactionPlaceholder === "false") {
    return PLACEHOLDERS[type].block;
  } else {
    return PLACEHOLDERS[type].labelled;
  }
}

// REDACT + REVERSE BUTTONS
let reversed = false;
const reverseBtn = document.getElementById("reverseBtn");

document.getElementById("redactBtn").addEventListener("click", () => {
  redactText(reversed);
});

reverseBtn.addEventListener("click", () => {
  reversed = !reversed;
  reverseBtn.setAttribute("aria-pressed", String(reversed));
  reverseBtn.textContent = reversed ? "Reverse: on" : "Reverse: off";
});

// EVENT WIRING
// CSP does not allow inline handlers (onclick/onchange)
// Every interactive element is wired by its id
document.getElementById("sidebar-btn").addEventListener("click", togglePanel);
document.getElementById("panelBackdrop").addEventListener("click", togglePanel);
document.getElementById("panelCloseBtn").addEventListener("click", togglePanel);
document
  .getElementById("darkmode-btn")
  .addEventListener("click", toggleDarkMode);
document.getElementById("tabIn").addEventListener("click", switchToIn);
document.getElementById("tabOut").addEventListener("click", switchToOut);
document
  .getElementById("flushBtn")
  .addEventListener("click", flushButtonAction);
document
  .getElementById("copyBtn")
  .addEventListener("click", copyClipboardContent);

// Thematic NLP redactors
document
  .getElementById("redact-orgs-btn")
  .addEventListener("click", redactOrgs);
document
  .getElementById("redact-names-btn")
  .addEventListener("click", redactNames);
document
  .getElementById("redact-dates-btn")
  .addEventListener("click", redactDates);
document
  .getElementById("redact-phones-btn")
  .addEventListener("click", redactPhones);
document
  .getElementById("redact-emails-btn")
  .addEventListener("click", redactEmails);
document
  .getElementById("redact-places-btn")
  .addEventListener("click", redactPlaces);

// Redaction placeholder (Block / Labelled) radio pills
document
  .getElementById("placeholderMode")
  .addEventListener("change", toggleRedactionPlaceholder);
