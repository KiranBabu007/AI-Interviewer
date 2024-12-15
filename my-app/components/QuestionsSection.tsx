import { Lightbulb, Volume2 } from 'lucide-react';
import React from 'react';

interface QuestionsSectionProps {
  mockInterviewQuestion: { question: string }[];
  activeQuestionIndex: number;
}

const QuestionsSection: React.FC<QuestionsSectionProps> = ({ mockInterviewQuestion, activeQuestionIndex }) => {

  const textToSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    } else {
      alert("Sorry, your browser does not support text to speech");
    }
  };

  return mockInterviewQuestion && (
    <div className='p-5 border rounded-lg my-10'>
      <div className='grid grid-cols-2 gap-5'>
        {mockInterviewQuestion.map((question, index) => (
          <div key={index}>
            <h2 className={`p-2 bg-secondary rounded-full text-xs md:text-sm text-center cursor-pointer ${activeQuestionIndex === index && 'bg-blue-600 text-black'}`}>
              Question #{index + 1}
            </h2>
          </div>
        ))}
      </div>
      <h2 className='my-5 text-md md:text-lg'>
        {mockInterviewQuestion[activeQuestionIndex]?.question}
      </h2>
      <Volume2 className="cursor-pointer" onClick={() => textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)} />
      <div className='border rounded-lg p-5 bg-blue-100 mt-20'>
        <h2 className='flex gap-2 items-center text-primary'>
          <Lightbulb />
          <strong>Note:</strong>
        </h2>
        <h2 className='text-sm text-primary my-2'>
          Click on Record Answer when you want to answer the question. At the end of the interview, we will give you the feedback along with the correct answer for each question and your answer to compare it.
        </h2>
      </div>
    </div>
  );
};

export default QuestionsSection;