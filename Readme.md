# NoteSync

NoteSync is a web application that allows users to create, edit, and manage their notes. The application is built with a React frontend and a Node/Express backend, and it uses MongoDB for data storage.

## Features

```markdown
- User authentication
- Create, edit, and delete notes
- Search notes
- Pin notes
```

## Installation

### Prerequisites

- Node.js
- MongoDB
- npm or yarn

## Backend Setup

1. Clone the repository
2. Navigate to the `backend` directory
3. Install dependencies

```bash
npm install
```

4. Create a `.env` file in the `backend` directory and add the following environment variables:

```
MONGODB_URI=<your_mongodb_uri>
ACCESS_TOKEN_SECRET=<your_access_token_secret>
SESSION_SECRET=<your_session_secret>
```

5. Start the server

```bash
npm start
```

## Frontend Setup

1. Navigate to the `frontend` directory
2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

## Usage

1. Register for an account
2. Log in with your credentials
3. Create, edit, and delete notes
4. Search notes
5. Pin notes

## Scripts

### Backend

- Start the server

```bash
npm start
```

### Frontend

- Start the development server

```bash
npm run dev
```

- Build the application for production

```bash
npm run build
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
