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

async function redactPlaces() {
  redactTxtDOM((txt) => {
    return nlp(txt).places().replaceWith(getPlaceholder("place")).all().text();
  });
}

// Comrpomise fails for international formats
async function redactPhones() {
  const phoneRegex =
    /(?<!\S)(?:\+?(\d{1,4}))?[-. (]*(\d{2,3})[-. )]*(\d{3})[-. ]*(\d{3,4})(?: *x(\d+))?/g;
  redactTxtDOM((txt) => replacePattern(txt, phoneRegex));
}

// Strategy: Regex-based patterns for phone numbers
function replacePattern(txt, regex, replacement = "█████") {
  return txt.replace(regex, replacement);
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
      out = out.replace(term.text, getPlaceholder("date"));
    }

    return out;
  });
}

// Strategy: Use regex with word boundaries for custom words
/*
 * Custom word redaction — pattern engine (drop-in replacement for
 * replaceWords() + redactText()).
 *
 * Syntax (one pattern per line):
 *   Peter /%/ Ruben   → "Peter" is replaced by "Ruben"
 *   Peter/%/Ruben     → same (whitespace around /%/ is optional)
 *   Peter/%/          → degrades to a plain redaction (default placeholder)
 *   Username          → redacted with the default placeholder
 *
 * Reverse mode swaps targets and replacements ("Ruben" becomes "Peter").
 * Plain patterns are ignored in reverse mode (no inverse exists).
 * If two pairs share a replacement word, the LAST pair wins (see README).
 *
 * Privacy: patterns and replacements stay in memory only.
 * No persistence, no network, no logging of pattern content.
 */

// Size cap to reduce attack surface
const RP_LIMITS = { maxPatterns: 500, maxPatternLength: 200 };
// TODO: Allow trailing whitespaces? "Peter /%/ Reuben" vs "Peter/%/Reuben"
const RP_SEPARATOR = /\s*\/%\/\s*/;
const RP_SEPARATOR_LITERAL = "/%/";

// Escape Regex metachars, quantifiers and wildcards
// Example: "C++" results as "C\+\+"
function escapeRegexMeta(s) {
  // "$&" -> use entire matched substring
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Parser for redaction-clipboard
// Parses each line and creates plain (w/o replacement) or pair (w replacements) patterns
function parsePatternLines(rawLines) {
  const pairs = []; // [target, replacement]
  const plain = new Set(); // patterns replaced by default placeholder
  let count = 0;

  for (const raw of rawLines) {
    // Gates: Trim, skip empty lines and enforce size caps
    const line = raw.trim();
    if (!line) continue;
    if (++count > RP_LIMITS.maxPatterns) break;
    if (line.length > RP_LIMITS.maxPatternLength) continue;

    // Patterns w/o replacement
    if (!line.includes(RP_SEPARATOR_LITERAL)) {
      plain.add(line);
      continue;
    }

    // Note: Everything after the FIRST separator is the replacement
    // Any additional separators stay literal to keep behavior stays predictable
    // Example: "a/%/b/%/c" on "a" yields "b/%/c", no double swapping
    const [target, ...rest] = line.split(RP_SEPARATOR);
    const replacement = rest.join(RP_SEPARATOR_LITERAL).trim();

    if (target && replacement) {
      pairs.push([target, replacement]);
    } else if (target) {
      // Handle patterns with a replacement seperator but not replacement
      // Example: "Peter/%/": no inverse, redact normally
      plain.add(target);
    }
  }
  return { pairs, plain };
}

// Build map of all the plain and paired patterns
// Cave: Paired patterns take precendence over plain ones!
// Example:
// Peter /%/ Reuben
// Peter
//
// The plain pattern is ignored, Peter is replaced by Reuben.
function buildPatternMap(rawLines, reversed) {
  const { pairs, plain } = parsePatternLines(rawLines);
  const map = new Map();

  // Reverse order of the pairs when reverse is on
  // Note: Plain patterns are never reversed, information is destroyed.
  if (reversed) {
    // Plain patterns have no inverse and are ignored
    // Edge case: duplicate replacement words are ambiguous; last pair wins.
    for (const [target, replacement] of pairs) {
      map.set(replacement, target);
    }
  } else {
    //
    for (const p of plain) map.set(p, null);
    // Pairs are set last: they always win over a plain pattern for the
    // same word, regardless of line order.
    for (const [target, replacement] of pairs) {
      map.set(target, replacement);
    }
  }
  return map;
}

// Build Regex pattern
// Note: Requires lookbehind (all modern browsers, Safari 16.4+).
function buildRedactionRegex(targets) {
  const alternation = [...targets]
    // Longest-first so "Peterson" wins over "Peter".
    .sort((a, b) => b.length - a.length)
    // Escape meta chars
    .map(escapeRegexMeta)
    .join("|");

  // Note: Unicode-aware boundaries also matches "Peter!" or "#Peter", but not "1Peter" or "aPeter"
  return new RegExp(
    `(?<![\\p{L}\\p{N}_])(?:${alternation})(?![\\p{L}\\p{N}_])`,
    "gu",
  );
}

function applyPatterns(txt, patternMap, defaultReplacement) {
  if (patternMap.size === 0) return txt;

  const regex = buildRedactionRegex(patternMap.keys());

  // Function replacer: prevents "$&"/"$1" substitution in replacement
  // strings, and a single pass guarantees replacements are never
  // re-processed by other patterns.

  // Coalescing is used to handle pairs (LHS) or plain (RHS)
  return txt.replace(
    regex,
    (match) => patternMap.get(match) ?? defaultReplacement,
  );
}

function redactText(reversed = false) {
  const el = document.getElementById("redactPatterns");
  const patterns = buildPatternMap(el.innerText.split("\n"), reversed);

  try {
    if (patterns.size === 0) {
      alert("Please enter patterns to redact.");
      return;
    }
    redactTxtDOM((txt) =>
      applyPatterns(txt, patterns, getPlaceholder("custom")),
    );
  } finally {
    // drop all pattern references after redaction
    patterns.clear();
  }
}

// Demo mode

const DEMO_TEXT = `My name is Peter from Sweden and I am getting this error message:
[2026-10-15 14:32:45] INFO: Initializing payment service
[2026-10-15 14:32:46] DEBUG: Connecting to CashMoney API with key: cm_live_51HyJ4K2eZvX9mPqL7nR8sT9uV0wXyZ1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sTu1vW
[2026-10-15 14:32:47] INFO: Authentication successful
[2026-10-15 14:32:48] ERROR: Failed to process payment. Response: {"error": "Invalid card", "api_key_used": "cm_live_51HyJ4K2eZvX9mPqL7nR8sT9uV0wXyZ1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sTu1vW"}


My username is peter@cashmoney.com by the way.
`;

const DEMO_PATTERNS =
  "Peter /%/ Reuben" +
  "\n" +
  "cm_live_51HyJ4K2eZvX9mPqL7nR8sT9uV0wXyZ1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sTu1vW";

document.getElementById("demoBtn").addEventListener("click", () => {
  document.getElementById("clipboardIn").innerText = DEMO_TEXT;
  document.getElementById("redactPatterns").innerText = DEMO_PATTERNS;
});
