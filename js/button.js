// TOGGLE DARK MODE FUNCTION
function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");
  document
    .getElementById("darkmode-btn")
    .setAttribute("aria-pressed", String(isDark));
}

// TOGGLE SIDE PANEL
function togglePanel() {
  const panel = document.querySelector(".side-panel");
  const backdrop = document.querySelector(".panel-backdrop");
  const sidebarBtn = document.getElementById("sidebar-btn");
  const isOpening = !panel.classList.contains("active");

  panel.classList.toggle("active");
  backdrop.classList.toggle("active");
  panel.inert = !isOpening;
  sidebarBtn.setAttribute("aria-expanded", String(isOpening));

  if (isOpening) {
    panel.querySelector(".close-btn").focus();
    document.addEventListener("keydown", onPanelKeydown);
  } else {
    document.removeEventListener("keydown", onPanelKeydown);
    sidebarBtn.focus();
  }
}

function onPanelKeydown(e) {
  if (e.key === "Escape") {
    togglePanel();
    return;
  }
  if (e.key !== "Tab") return;

  const panel = document.querySelector(".side-panel");
  const focusables = [
    ...panel.querySelectorAll("button, input, [href], [tabindex]"),
  ];
  if (focusables.length === 0) return;

  e.preventDefault();
  const idx = focusables.indexOf(document.activeElement);
  let next;

  if (e.shiftKey) {
    next = idx <= 0 ? focusables.length - 1 : idx - 1;
  } else {
    next = idx === focusables.length - 1 || idx === -1 ? 0 : idx + 1;
  }
  focusables[next].focus();
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
function showFeedback(btn) {
  btn.classList.add("is-done");
  setTimeout(() => btn.classList.remove("is-done"), 1000);
}

// TODO: Make a little animation so that its clear something happened!
async function flushButtonAction() {
  const btn = document.getElementById("flushBtn");
  showFeedback(btn);
  flushOutput();
  switchToIn();
}

async function flushAllButtonAction() {
  const btn = document.getElementById("flushAllBtn");
  showFeedback(btn);
  flushOutput();
  flushInput();
  switchToIn();
}

// COPY-PASTE BUTTON
async function copyClipboardContent() {
  const content = document.getElementById("clipboardOut").innerText;
  await navigator.clipboard.writeText(content);

  // Visual feedback
  const btn = document.getElementById("copyBtn");
  showFeedback(btn);
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
  .getElementById("flushAllBtn")
  .addEventListener("click", flushAllButtonAction);
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

// Mobile Popup
document.getElementById("mobileDismissBtn").addEventListener("click", () => {
  document.body.classList.add("mobile-dismissed");
  document.getElementById("clipboardIn").focus();
});
