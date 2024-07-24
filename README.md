# Collaborative Code Editor

A real-time collaborative code editing platform built with React, Firebase, and Tailwind CSS.

## Features

- Real-time collaborative code editing
- User authentication (signup, login, logout)
- Project management (create, delete, share projects)
- Dark mode support
- Syntax highlighting for JavaScript/JSX
- Responsive design

## Technologies Used

- React.js
- Firebase (Authentication, Firestore)
- Tailwind CSS
- CodeMirror

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or later)
- npm (v6 or later)
- A Firebase account and project

## Setup and Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/collaborative-code-editor.git
   cd collaborative-code-editor
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your Firebase configuration:

   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:

   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Usage

1. Sign up for a new account or log in with existing credentials.
2. Create a new project or select an existing one from the project list.
3. Start coding in the editor. Changes will be synced in real-time for all collaborators.
4. Use the "Share" feature to invite other users to collaborate on your project.
5. Toggle between light and dark modes using the theme switch in the header.

## Contributing

Contributions to the Collaborative Code Editor are welcome. Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions or feedback, please reach out to [your-email@example.com](mailto:your-email@example.com).

## Acknowledgements

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [CodeMirror](https://codemirror.net/)
