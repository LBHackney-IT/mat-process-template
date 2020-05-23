# Manage a Tenancy - TODO

## How to use this template

1. Change the readme heading above to `Manage a Tenancy - <processName>`,
   replacing `<processName>` with the full name of the process (e.g.
   `Manage a Tenancy - Tenancy and Household Check`)
1. Find and replace all `TODO`s in this project
1. Rename `pages/TODO` to `pages/<basePath>`, `public/TODO` to
   `public/<basePath>`, and `__tests__/pages/TODO` to
   `__tests__/pages/<basePath>`, replacing `/<basePath>` in each with the value
   specified in `config/basePath.js`
1. Remove this section from the readme

## Technical overview

This project is built with [TypeScript](https://www.typescriptlang.org/) and
[Next.js](https://nextjs.org/).

We use:

- [`styled-jsx`](https://github.com/zeit/styled-jsx) for styling components
- [Normalize.css](http://necolas.github.io/normalize.css/) to normalize styles
  across browsers
- [Docker](https://www.docker.com/) to deploy and run the service
- [Jest](https://jestjs.io/), [Cucumber](https://cucumber.io/), and
  [Selenium WebDriver](https://seleniumhq.github.io/selenium/docs/api/javascript/)
  for building and running tests
- [ESLint](https://eslint.org/) for linting
- [Prettier](https://prettier.io/) for code formatting

## Dependencies

- [Node.js](https://nodejs.org/)

  We assume you are using the version of Node.js documented in
  [`.node-version`](.node-version). We recommend using
  [`nodenv`](https://github.com/nodenv/nodenv) with
  [`node-build-update-defs`](https://github.com/nodenv/node-build-update-defs)
  to manage Node.js versions.

- Google Chrome and
  [ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/home) or
  Firefox and [geckodriver](https://github.com/mozilla/geckodriver)

  We use these for running feature tests locally. Make sure your installed
  versions match each other.

## Getting started

1. Copy `.env.example` to `.env` and fill in the blanks.

1. Create yourself a working process for local development in the OutSystems
   development environment, setting `TEST_PROCESS_REF` in your `.env` to its
   reference.

1. Install the required packages:

   ```bash
   npm install
   ```

1. Run the development server:

   ```bash
   npm run dev
   ```

1. Navigate to [`http://localhost:3000/TODO`](http://localhost:3000/TODO).

1. Make a change, and see the page hot reload.

### Changing the server code

Hot reloading isn't set up for the local server, so you will need to restart it
to see any changes to files in `server/`.

### Using service workers

The project is configured to only generate a service worker in production mode.
If you want to try offline functionality locally, you will need to use:

```bash
npm run build && npm start
```

### Choosing a process stage

One of the parameters passed to the process when starting it is the current
process stage:

- `"0"`: in progress
- `"1"`: in manager review
- `"2"`: approved
- `"3"`: declined

We use the `TEST_PROCESS_STAGE` environment variable to set this value locally
during development. Override it in your `.env` file to work on a different
stage.

## Running the tests

We use [Jest](https://jestjs.io/) for testing. Feature tests are driven by
[Selenium Webdriver](https://seleniumhq.github.io/selenium/docs/api/javascript/)
to test in browser.

To run the unit tests:

```bash
npm run test:unit
```

To run the unit tests, updating changed snapshots:

```bash
npm run test:unit:update
```

To run the unit tests in watch mode:

```bash
npm run test:unit:watch
```

To run the feature tests:

```bash
npm run test:feature
```

To run the feature tests, updating changed snapshots:

```bash
npm run test:feature:update
```

To run the full test suite:

```bash
npm test
```

To run the full test suite, fixing any issues and updating snapshots:

```bash
npm run test:update
```

### Browser support

We support running the feature tests in Google Chrome and Firefox, headless or
not.

The following environment variables customize the browser options for testing:

- `TEST_BROWSER` determines the browser to use.

  Accepted values:

  - `chrome` **(default)**
  - `firefox`

- `TEST_HEADLESS` determines if we run the browser in headless mode or not.

  Accepted values:

  - `0` for off
  - `1` for on **(default)**

## Formatting the code

We use [Prettier](https://prettier.io/) to format our code. There are lots of
[editor integrations](https://prettier.io/docs/en/editors.html) available, and
the style is enforced by a Git pre-commit hook.

To run the formatter:

```bash
npm run format
```

## Linting the code

We use [ESLint](https://eslint.org/), in addition to TypeScript's compiler, for
verifying correctness and maintainability of code.

To run the linter:

```bash
npm run lint
```

To run the linter in fix mode:

```bash
npm run lint:fix
```

We can also check that all files (except `package.json` and `package-lock.json`
because Dependabot can get very noisy) have code owners:

```sh
npm run lint:codeowners
```

## Architecture decision records

We use ADRs to document architecture decisions that we make. They can be found
in `docs/adr` and contributed to with
[adr-tools](https://github.com/npryce/adr-tools).

## Access

To access this process running on live infrastructure, start a new TODO from the
Manage a Tenancy hub.

## Source

This repository was bootstrapped from
[`mat-process-template`](https://github.com/LBHackney-IT/mat-process-template),
which was built from
[`mat-process-thc`](https://github.com/LBHackney-IT/mat-process-thc), which was
bootstrapped from dxw's
[`react-template`](https://github.com/dxw/react-template).
