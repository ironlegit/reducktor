// HELPER FUNCTIONS
function flushOutput() {
  document.getElementById("clipboardOut").textContent = "";
}

// REDACTION FUNCTIONS

// DOM Wrapper - Gets text and applies redaction function
async function redactTxtDOM(redactFunc, replacement = "█████") {
  const inEl = document.getElementById("clipboardIn");

  // Feels more natural
  if (inEl.innerText.trim() === "") {
    flushOutput();
  }

  const outEl = document.getElementById("clipboardOut");

  // Apply redaction on output if non-empty
  const source = outEl.innerText.trim() ? outEl : inEl;
  outEl.innerText = redactFunc(source.innerText, replacement);
  switchToOut();
}

// Strategy: Regex-based patterns
function replacePattern(txt, regex, replacement = "█████") {
  return txt.replace(regex, replacement);
}

// Custom entity level function
// NOTE: To debug Compromise tokens use console.log(JSON.stringify(nlp(txt).places().json(), null, 2));
async function redactOrgs() {
  redactTxtDOM((txt) => {
    return nlp(txt)
      .organizations()
      .replaceWith(getPlaceholder("org"))
      .all()
      .text();
  });
}

async function redactNames() {
  redactTxtDOM((txt) => {
    return nlp(txt).people().replaceWith(getPlaceholder("name")).all().text();
  });
}

async function redactEmails() {
  redactTxtDOM((txt) => {
    return nlp(txt).emails().replaceWith(getPlaceholder("email")).all().text();
  });
}

async function redactPlaces(txt) {
  redactTxtDOM((txt) => {
    console.log(nlp(txt).places());
    return nlp(txt).places().replaceWith(getPlaceholder("place")).all().text();
  });
}

async function redactPhones() {
  const phoneRegex =
    /(?<!\S)(?:\+?(\d{1,4}))?[-. (]*(\d{2,3})[-. )]*(\d{3})[-. ]*(\d{3,4})(?: *x(\d+))?/g;
  redactTxtDOM((txt) => replacePattern(txt, phoneRegex));
}

// Handling dates with compromise date (distinct logic)

nlp.plugin(compromiseDates);
// TODO: Exclude weekdays option?
async function redactDates() {
  redactTxtDOM((txt) => {
    // Avoid redacting prepositions and weekedays and the like
    const exclusionList = ["Preposition", "Determiner", "Ordinal", "Noun"];
    const dates = nlp(txt).dates().json();
    const filteredTerms = [];

    for (const date of dates) {
      for (const term of date.terms) {
        const skipTerm = term.tags.some((tag) => exclusionList.includes(tag));
        if (!skipTerm) {
          filteredTerms.push(term);
        }
      }
    }

    let out = txt;

    for (const term of filteredTerms) {
      console.log(term.text);
      out = out.replace(term.text, getPlaceholder("date"));
    }

    return out;
  });
}

// Strategy: Use NLP-extracted entities and name lists with word boundaries
function replaceWords(txt, words, replacement = "█████") {
  if (words.length === 0) return txt;

  // Sort to avoid sub-string / prefix matching
  const escaped = words
    .sort((a, b) => b.length - a.length)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  // TODO: Custom word boundaries that may end with punctuation instead of just whitespace
  const regex = new RegExp(`\\b(${escaped.join("|")})`, "g");

  return txt.replace(regex, replacement);
}

function redactText() {
  const patterns = document
    .getElementById("redactPatterns")
    .innerText.split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (patterns.length === 0) {
    alert("Please enter patterns to redact.");
    return;
  }

  redactTxtDOM((txt) => replaceWords(txt, patterns, getPlaceholder("custom")));
}

// DECREP
// DECREP
// DECREP
// Might be interesting to rethink using other API
// Cache for the name list (loaded once)

let nameList = {};

// TODO: International names + ignore case leads to false positives
async function loadNames() {
  if (!currentRegionPath) {
    console.error("No region selected");
    return;
  }
  // Return cached list if already loaded
  if (nameList[currentRegionPath]) return nameList[currentRegionPath];

  const response = await fetch(currentRegionPath);
  const text = await response.text();
  const names = text.split("\n").filter((name) => name.trim().length > 0);

  nameList[currentRegionPath] = names;
  console.log(names);
  return names;
}

async function redactNames_old() {
  const names = await loadNames();
  redactTxtDOM((txt) => replaceWords(txt, names, getPlaceholder("name")));
}
