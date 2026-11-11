<p align="center">
  <img src="assets/reducktor.svg" alt="reducktor" width="320">
</p>

<p align="center">
  <a href="https://github.com/ironlegit/reducktor/tags"><img alt="Version" src="https://img.shields.io/github/v/tag/ironlegit/reducktor?filter=v*"></a>
  <a href="https://sonarcloud.io/dashboard?id=ironlegit_reducktor"><img alt="Quality Gate Status" src="https://sonarcloud.io/api/project_badges/measure?project=ironlegit_reducktor&metric=alert_status"></a>
  <a href="https://sonarcloud.io/dashboard?id=ironlegit_reducktor"><img alt="Maintainability Rating" src="https://sonarcloud.io/api/project_badges/measure?project=ironlegit_reducktor&metric=sqale_rating"></a>
  <a href="https://sonarcloud.io/dashboard?id=ironlegit_reducktor"><img alt="Security Rating" src="https://sonarcloud.io/api/project_badges/measure?project=ironlegit_reducktor&metric=security_rating"></a>
  <a href="https://sonarcloud.io/dashboard?id=ironlegit_reducktor"><img alt="Bugs" src="https://sonarcloud.io/api/project_badges/measure?project=ironlegit_reducktor&metric=bugs"></a>
</p>

**Re🦆tor** is a small privacy-first web-app that scrubs sensitive information from text before you share it.

Need to send logs to support, but not sure the API key is buried in there? Debugging with an LLM, but not keen on leaking every path, token and secret on your machine?

<div align="center">
<kbd>Paste in</kbd> &rarr; <kbd>Redact</kbd> → <kbd>Copy out</kbd>
</div>

# Features

- **Custom Redactor**: Enter custom strings to remove or replace sensitive information from your text.
- **Thematic Redactors**: Use thematic redaction options (based on [Compromise](https://github.com/spencermountain/compromise)) to remove sensitive information from your text.

## How to use

Enter the text you want to redact in the top text field. Choose from the `Thematic NLP Redactors` or add your own patterns (one per line) in the lower text field. The redacted output appears in the read-only `Redacted` tab; your input stays untouched under `Original. Click the trash icon to clear the redacted output, e.g. after editing the original.

## Thematic NLP

Use the buttons to replace patterns from the predefined categories (e.g. emails, places, and names) with functionalities from the compromise NLP library. The names category mostly covers Anglophone names.

There are no API calls, the NLP library is vendored locally and runs client-side.

## Custom word patterns

Write one pattern per line in the pattern box; each line is redacted wherever
it appears in the text, using your selected placeholder style.

To replace a word with a specific word instead of the placeholder, write `target /%/ replacement`. For example, `Peter /%/ Reuben` turns every "Peter" in the text into "Reuben".

> Note: Spaces around `/%/` are optional. `Peter/%/Reuben` works the same.

### Edge cases

| Case             | Patterns in the box                        | Text                                     | Result                                                                                                           |
| ---------------- | ------------------------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Substring safety | `Peter`                                    | `Peterson met Peter.`                    | `Peterson met █████.`: Patterns match whole words only, never inside longer words                                |
| Pair beats plain | `Peter /%/ Reuben` and `Peter`             | `Peter called.`                          | `Reuben called.`: `/%/` pairs always take precedence over plain patterns, regardless of line order               |
| Last pair wins   | `Peter /%/ Reuben` and `Peter /%/ Günther` | `Peter called.`                          | `Günther called.`: When two pairs share a target, the last line is applied                                       |
| Word boundaries  | `Peter`                                    | `Peter, #Peter, Peter! … 1Peter, aPeter` | `█████, #█████, █████! … 1Peter, aPeter`: Letters and digits count as word characters, punctuation and `#` don't |

### Reverse mode

Swaps targets and replacements: "Peter `/%/` Ruben" turns "Ruben" back into "Peter".
Plain patterns without `/%/` are ignored in reverse mode. If two patterns map to the same replacement word, the last pair wins, hence choose unique replacements.

## Privacy

All patterns and replacements stay in your browser: nothing is stored, logged, or sent anywhere.

Verify it yourself: open DevTools &rarr; Network tab, run a redaction. No requests should be made by the app during that action. This is enforced by Content-Security-Policy (CSP).

> Note: This site’s CSP cannot disable or control browser extensions installed by users. Extensions may still access or modify page content depending on their permissions.

# Dependencies

The thematic redactors rely on the JS modules `compromise` and `compromise-dates`.
Fixed versions are pinned in `package-lock.json` and vendored locally under `/vendor`.
See `vendor/MANIFEST.md` for exact versions and sources.

**Dependabot** tracks upstream releases and opens a PR when a newer version is
available. Vendor updates are generated by `scripts/vendor-audit.sh`.

**Reason**: Instead of loading NLP libraries from a public CDN at runtime, the
vendor pinned builds of compromise and compromise-dates are stored in `vendor/`.

> Check for vulnerabilities on [socket.dev](socket.dev) to be safe.

## Updating vendored libraries

> The first CI run on a fresh Dependabot PR is **red by design**
> Updating the vendored packages is a manual task.

1. Check out the Dependabot PR branch:
2. Regenerate the vendor files:
   `bash scripts/vendor-audit.sh`
3. Commit and push them to the same branch:
4. Wait for CI to go green, then merge the PR.

**If Dependabot rebases the PR afterwards and it goes red again:**
just repeat steps 1–3.

# Installation and Use

From root folder run one of the following to start a local development server:

- `npx serve`
- `python -m http.server 8000`

Open localhost in browser.

# Credits

All fonts and icons are self-hosted; nothing is loaded from third-party servers.

- **[Syne Mono](https://fonts.google.com/specimen/Syne+Mono)** originally designed
  in 2017 by Bonjour Monde (Lucas Descroix) for the Art Center "Synesthésie",
  Saint-Denis. Licensed under the SIL Open Font License 1.1
  ([license file](assets/fonts/syne-mono-OFL.txt)). Served: latin, latin-ext.
- **[Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)** designed
  by CodeMan38, based on the font design of 1980s Namco arcade games. Licensed
  under the SIL Open Font License 1.1
  ([license file](assets/fonts/press-start-2p-OFL.txt)). Served: latin, latin-ext.
- **Font Awesome Free 6.5.0** © Fonticons, Inc. Icons licensed under
  CC BY 4.0, fonts under the SIL Open Font License 1.1, code under the MIT
  License ([license file](assets/fontawesome/LICENSE.txt)).
