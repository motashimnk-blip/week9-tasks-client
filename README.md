# Week 9 - Authenticated Tasks Client

A Next.js frontend for the Week 8 Authenticated Tasks API.

This project provides a task-management interface with JWT authentication, protected routes, task creation, task deletion, task filtering, API error handling, and automated tests.

## Features

- User login using email and password
- JWT authentication
- Persistent login session using `localStorage`
- Protected `/tasks` page
- Automatic `Authorization: Bearer <token>` header
- Automatic handling of expired/invalid authentication
- Task listing
- Empty task state
- Create a new task
- Delete tasks
- Filter tasks by status
- Display project and assignee information
- API error handling
- Form validation
- Form values preserved when API validation fails
- Jest and React Testing Library tests
- GitHub Actions CI
- Production build verification

## Project Structure

```text
week9-tasks-client/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── __tests__/
│   ├── api.test.ts
│   ├── create-task.test.tsx
│   └── tasks.test.tsx
│
├── app/
│   ├── tasks/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   └── AuthProvider.tsx
│
├── lib/
│   ├── api.ts
│   └── session.ts
│
├── public/
│
├── .env.example
├── .gitignore
├── jest.config.ts
├── jest.setup.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
````

## Requirements

* Node.js 20 or later
* npm
* Week 8 Authenticated Tasks API running locally
* PostgreSQL database configured for the Week 8 API

## Environment Variables

Create a local environment file:

```text
.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

The application uses the Week 8 API running on port `3000`.

An example environment file is included:

```text
.env.example
```

with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Do not commit `.env.local` or other private environment files.

## Installation

Clone the repository and enter the project directory:

```bash
cd week9-tasks-client
```

Install dependencies:

```bash
npm ci
```

Alternatively:

```bash
npm install
```

## Running the Application

Start the development server:

```bash
npm run dev
```

The Week 9 frontend runs at:

```text
http://localhost:3001
```

The Week 8 API should be running at:

```text
http://localhost:3000
```

## Authentication

The login page sends the user's credentials to the Week 8 API.

After a successful login, the JWT access token is stored locally and automatically attached to API requests:

```text
Authorization: Bearer <token>
```

The authenticated user session is managed through:

```text
lib/session.ts
```

The API wrapper is implemented in:

```text
lib/api.ts
```

The application uses the `AuthProvider` component to manage authentication state and protected navigation.

## Main Routes

### Login

```text
/login
```

Allows the user to authenticate with the Week 8 API.

### Tasks

```text
/tasks
```

Protected page where authenticated users can:

* View tasks
* Filter tasks by status
* Create tasks
* Delete tasks

Unauthenticated users are redirected to the login page.

## API Integration

The frontend communicates with the Week 8 Authenticated Tasks API.

The main API endpoints used by the client include:

```text
POST /auth/login
GET /tasks
POST /tasks
DELETE /tasks/:id
```

The API wrapper automatically adds the JWT token when one exists.

API errors are converted into an `ApiError` object containing:

* HTTP status
* Error type
* Error message
* Validation messages

## Testing

The project uses Jest and React Testing Library.

Run the complete test suite:

```bash
npm test
```

### API Wrapper Tests

```text
__tests__/api.test.ts
```

Tests:

* Authorization header is added when a token exists
* Authorization header is not added without a token
* 204 responses are handled correctly
* Failed API responses throw `ApiError`

### Task List Tests

```text
__tests__/tasks.test.tsx
```

Tests:

* Tasks returned by the API are rendered
* Empty state is rendered when no tasks exist

### Create Task Tests

```text
__tests__/create-task.test.tsx
```

Tests:

* Successful task creation clears the form
* Client-side validation preserves form values
* API validation errors preserve form values

Run a specific test file:

```bash
npm test -- api.test.ts
```

```bash
npm test -- tasks.test.tsx
```

```bash
npm test -- create-task.test.tsx
```

## Test Results

The complete test suite currently passes:

```text
Test Suites: 3 passed, 3 total
Tests:       9 passed, 9 total
```

## Production Build

Create an optimized production build:

```bash
npm run build
```

The production build currently completes successfully.

## GitHub Actions CI

The project includes a GitHub Actions workflow:

```text
.github/workflows/ci.yml
```

The CI workflow runs on Node.js 20 and performs:

```bash
npm ci
npm test
npm run build
```

The CI workflow runs for pushes and pull requests targeting the `main` or `master` branch.

The CI process does not require the Week 8 API or PostgreSQL because the frontend tests mock the API calls.

## Environment and Security

The following files should remain local and should not be committed:

```text
.env.local
.env
```

The repository includes:

```text
.env.example
```

for documenting the required environment variable without exposing local configuration.

## Development Workflow

1. Start the Week 8 API.
2. Make sure PostgreSQL is running.
3. Configure `.env.local`.
4. Start the Week 9 frontend.
5. Open the login page.
6. Sign in with a valid API user.
7. Use the protected Tasks page.
8. Create, filter, and delete tasks.
9. Run the complete test suite.
10. Run the production build before submitting.

## Verification

The project has been verified locally with:

```bash
npm test
```

Result:

```text
Test Suites: 3 passed, 3 total
Tests:       9 passed, 9 total
```

Production build:

```bash
npm run build
```

Result:

```text
Compiled successfully
Finished TypeScript
Generating static pages
Finalizing page optimization
```

## Status

Week 9 Tasks Client:

* Authentication: Complete
* Protected Tasks Page: Complete
* Task Management: Complete
* API Integration: Complete
* Error Handling: Complete
* Automated Tests: Complete
* Production Build: Complete
* GitHub Actions CI: Complete
* Documentation: Complete

```
```
