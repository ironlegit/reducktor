<p align="center">
  <img src="assets/reducktor.svg" alt="flagr" width="320">
</p>

**Re🦆tor** is a web tool that helps you remove sensitive information from text, including emails and log files. Use it to safely prepare text for pasting into an LLM chat or sharing with support.

## Features

- **Thematic Redactors**: Use thematic redaction options (based on [Compromise](https://github.com/spencermountain/compromise)) to remove sensitive information from your text.
- **Name Redactor**: Use experimental name redaction to remove common first and last names from different regions. The names were selected from the Python [names-dataset](https://pypi.org/project/names-dataset/).
- **Custom Redactor**: Enter custom strings to remove sensitive information from your text.

## Dependencies

The thematic redactors rely on the JS modules `compromise` and `compromise-dates`.
Fixed versions are vendored locally under `/vendor`. See `vendor/MANIFEST.md` for
exact versions and sources.

Dependabot tracks upstream releases and opens a PR when a newer version is
available. Updates must be vendored (downloaded and re-verified) manually.

Check for vulnerabilities on [socket.dev](socket.dev) to be safe.

## Local Testing

From root folder run one of the following to start a local development server:

- `npx serve`
- `python -m http.server 8000`

Open localhost in browser for testing.
