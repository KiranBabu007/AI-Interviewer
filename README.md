# AI Interviewer Platform

AI Interviewer is a web-based platform designed to help users practice and improve their interview skills through mock interviews. The platform leverages facial recognition, screen monitoring, and behavioral analysis to provide a realistic interview environment. It is built with Next.js, Supabase, and the Gemini framework for robust and scalable performance.

## Features

- **Mock Interviews**: Simulate real interview environments with AI-driven question generation.
- **Facial Recognition**: Ensure user identity and track attention during the interview.
- **Screen Monitoring**: Prevent tab switching to maintain focus.
- **Behavioral Analysis**: Analyze user responses to provide feedback on strengths and areas for improvement.
- **Dynamic Question Generation**: Generate questions based on user-selected job roles or topics.
- **Real-time Feedback**: Provide instant feedback on performance after each interview session.
- **Proctoring Tools**: Monitor user behavior to ensure integrity during mock interviews.

## Technology Stack

- **Frontend**: Built with [Next.js](https://nextjs.org/) for server-side rendering and fast page loads.
- **Backend**: Powered by [Supabase](https://supabase.io/) for authentication, database management, and real-time data handling.
- **AI and Analytics**: Uses [Gemini](https://gemini.ai/) for advanced AI capabilities including question generation and behavioral analysis.
  
## Setup and Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/ai-interviewer.git
    ```
2. **Navigate to the project directory**:
    ```bash
    cd ai-interviewer
    ```
3. **Install dependencies**:
    ```bash
    npm install
    ```
4. **Set up environment variables**:
    Create a `.env.local` file in the root directory and add the necessary environment variables for Supabase and Gemini.

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    GEMINI_API_KEY=your-gemini-api-key
    ```

5. **Run the development server**:
    ```bash
    npm run dev
    ```
   Visit `http://localhost:3000` to view the application.

## Usage

1. **Sign Up**: Create an account to start using the platform.
2. **Select Interview Type**: Choose between technical, HR, or behavioral interviews.
3. **Start Interview**: Begin the interview session with real-time monitoring and question generation.
4. **Receive Feedback**: Review performance metrics and feedback provided after the interview.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any feature additions or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For any inquiries or feedback, please reach out at [your-email@example.com](mailto:your-email@example.com).

---

**Note**: This project is a proof of concept and is intended for educational purposes only.
