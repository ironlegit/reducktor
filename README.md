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

**Re🦆tor** is a web tool that helps you remove sensitive information from text, including emails and log files. Use it to safely prepare text for pasting into an LLM chat or sharing with support.

## Features

- **Custom Redactor**: Enter custom strings to remove sensitive information from your text.
- **Thematic Redactors**: Use thematic redaction options (based on [Compromise](https://github.com/spencermountain/compromise)) to remove sensitive information from your text.
- **Name Redactor (decrepated)**: Use experimental name redaction to remove common first and last names from different regions. The names were selected from the Python [names-dataset](https://pypi.org/project/names-dataset/).

## Dependencies

The thematic redactors rely on the JS modules `compromise` and `compromise-dates`.
Fixed versions are vendored locally under `/vendor`. See `vendor/MANIFEST.md` for exact versions and sources.

**Dependabot** tracks upstream releases and opens a PR when a newer version is available. Updates must be vendored (downloaded and re-verified) manually.

**Reason**: Instead of loading NLP libraries from a public CDN at runtime, the vendor pinned builds of compromise and compromise-dates are stored in `vendor/`.

> Check for vulnerabilities on [socket.dev](socket.dev) to be safe.

## Local Testing

From root folder run one of the following to start a local development server:

- `npx serve`
- `python -m http.server 8000`

Open localhost in browser for testing.
