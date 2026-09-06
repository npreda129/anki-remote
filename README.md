A simple web frontend for [Anki](https://apps.ankiweb.net/), built on top of the [AnkiConnect](https://github.com/amikey/anki-connect) API. It lets you study your Anki decks from any device with a web browser.

## Prerequisites

- Anki installed and running
- The AnkiConnect add-on installed in Anki
- [Node.js](https://nodejs.org/)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/npreda129/anki-remote.git
   cd anki-remote
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Make sure Anki is open with AnkiConnect installed and running.

4. Start the server:
   ```bash
   npm start
   ```

5. Open your browser to `http://localhost:3000`

## Running Tests

This project includes an automated end-to-end test suite written in Cypress covering [core features, e.g., deck search/filtering].

To open the Cypress test runner:
```bash
npx cypress open
```

To run tests headlessly:
```bash
npm run test:e2e
```
