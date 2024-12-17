import { Lightbulb, Volume2 } from "lucide-react";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation"

interface QuestionsSectionProps {
  mockInterviewQuestion: { question: string }[];
  activeQuestionIndex: number;
}

const QuestionsSection: React.FC<QuestionsSectionProps> = ({
  mockInterviewQuestion,
  activeQuestionIndex,
}) => {
  const textToSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    } else {
      alert("Sorry, your browser does not support text to speech");
    }
  };

  const router = useRouter();
  return (
    mockInterviewQuestion && (
      <div className="p-5 z-10 rounded-lg my-10">
        
        <div className="mb-5 ">
        <AlertDialog>
          <AlertDialogTrigger className="h-9 px-6 text-sm bg-red-700 text-white rounded-lg hover:bg-red-800 z-50">Go back to Dashboard</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This would interrupt the ongoing interview
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push('/dashboard')}>Proceed to Dashboard</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {mockInterviewQuestion.map((question, index) => (
            <div key={index}>
              <h2
                className={`p-2 bg-secondary text-black rounded-full text-xs md:text-sm text-center cursor-pointer ${
                  activeQuestionIndex === index && "bg-blue-600 text-black"
                }`}
              >
                Question #{index + 1}
              </h2>
            </div>
          ))}
        </div>
        <h2 className="my-5 text-md md:text-lg text-white">
          {mockInterviewQuestion[activeQuestionIndex]?.question}
=======
  return mockInterviewQuestion && (
    <div className='p-5  z-10 rounded-lg my-10'>
      <div className='grid grid-cols-2 gap-5'>
        {mockInterviewQuestion.map((question, index) => (
          <div key={index}>
            <h2 className={`p-2 bg-secondary text-black rounded-full text-xs md:text-sm text-center cursor-pointer ${activeQuestionIndex === index && 'bg-blue-600 text-black'}`}>
              Question #{index + 1}
            </h2>
          </div>
        ))}
      </div>
      <h2 className='my-5 text-md md:text-lg text-white'>
        {mockInterviewQuestion[activeQuestionIndex]?.question}
      </h2>
      <Volume2 className="cursor-pointer bg-black text-white" onClick={() => textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)} />
      <div className='border rounded-lg p-5 opacity-70 bg-gray-100 mt-20'>
        <h2 className='flex gap-2 items-center text-primary'>
          <Lightbulb />
          <strong>Note:</strong>
        </h2>
        <h2 className='text-sm text-primary my-2'>
          Click on Record Answer when you want to answer the question. At the end of the interview, we will give you the feedback along with the correct answer for each question and your answer to compare it.

        </h2>
        <Volume2
          className="cursor-pointer"
          onClick={() =>
            textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)
          }
        />
        <div className="border rounded-lg p-5 opacity-70 bg-gray-100 mt-20">
          <h2 className="flex gap-2 items-center text-primary">
            <Lightbulb />
            <strong>Note:</strong>
          </h2>
          <h2 className="text-sm text-primary my-2">
            Click on Record Answer when you want to answer the question. At the
            end of the interview, we will give you the feedback along with the
            correct answer for each question and your answer to compare it.
          </h2>
        </div>
      </div>
    )
  );
};

export default QuestionsSection;
