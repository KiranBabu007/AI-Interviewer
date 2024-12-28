# AI Interviewer Project

AI Interviewer is an advanced platform designed to simulate technical interviews for aspiring software developers. It provides dynamic and interactive coding questions, evaluates solutions, and offers insightful feedback, helping candidates prepare for real-world technical interviews with ease.

---

## Features

- **Interactive Interview Sessions:** Simulate real-time technical interviews.
- **Adaptive Question Levels:** Questions vary from beginner to advanced, tailored to the user's skills.
- **Performance Analysis:** Get detailed reports after every session, including strengths and areas for improvement.
- **Customizable Question Categories:** Focus on specific topics such as Data Structures, Algorithms, OOP, or System Design.
- **Intelligent Feedback:** Receive AI-generated feedback for optimized learning.
- **Code Execution Environment:** Supports live coding and evaluates code against test cases.

---

## Tech Stack

- **Frontend:** React.js with Tailwind CSS for a clean and responsive UI.
- **Backend:** Node.js with Express.js for handling API requests.
- **Database:** Firebase for user data management and session tracking.
- **AI Integration:** OpenAI's GPT API for question generation and evaluation.
- **Testing:** Jest and Cypress for unit and end-to-end testing.

---

## Installation

### Prerequisites

- Node.js (v16 or later)
- Firebase account and project setup
- OpenAI API key

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ai-interviewer.git
   cd ai-interviewer
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory and add:

   ```env
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:

   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000`.

---

## Usage

1. Register or log in to the platform.
2. Choose your desired topic and difficulty level.
3. Begin an interactive interview session.
4. Review the performance report at the end of the session.

---

## Contributing

We welcome contributions to make AI Interviewer even better! Follow these steps:

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature-name
   ```

3. Commit your changes:

   ```bash
   git commit -m "Add a brief description of your changes"
   ```

4. Push to the branch:

   ```bash
   git push origin feature-name
   ```

5. Open a Pull Request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Inspired by technical interview preparation tools.
- Built with the support of OpenAI and Firebase technologies.

---
