"use client"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle, Code2, Users, PlayCircle, LoaderCircle, File, X } from 'lucide-react'
import { useRouter } from "next/navigation"

const AddInterview = () => {
  const [open, setOpen] = useState(false);
  const [interviewType, setInterviewType] = useState("technical"); // Default to "technical"
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [resume, setResume] = useState<File | null>(null); // State for resume file
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('interviewType', interviewType);
      formData.append('role', role);
      formData.append('experience', experience);
      if (resume) {
        formData.append('resume', resume); // Append resume file if it exists
      }

      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewType,
          role,
          experience
        })
        
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setOpen(false);
      router.push('/dashboard/interview/' + data.mockId);
    } catch (error) {
      console.error('Error creating interview:', error);
      alert('Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setResume(file); // Set the selected file to the resume state
    }
  };

  const handleRemoveResume = () => {
    setResume(null); // Clear the resume state
    const fileInput = document.getElementById('resume') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Reset the file input
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="flex items-center space-x-2 rounded scale-105 transition-all p-8 px-20 bg-white">
            <PlusCircle className="w-5 h-5" />
            <span>Add Interview</span>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-2xl">Configure AI Mock Interview</DialogTitle>
            <DialogDescription>
              Choose the details for your AI-powered mock interview session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="interview-type">Interview Type</Label>
              <div className="relative w-80 h-8 rounded-lg bg-white border-black">
                <div 
                  className={`absolute top-0 left-0 w-1/3 h-full bg-black transition-all duration-300 ease-in-out 
                    ${interviewType === 'hr' ? 'translate-x-full' : interviewType === 'resume' ? 'translate-x-[200%]' : ''}`}
                />
                
                <div className="relative z-10 flex rounded-lg h-full">
                  <button 
                    onClick={() => setInterviewType('technical')}
                    className={`w-1/3 flex items-center justify-center gap-2 transition-colors duration-300 
                      ${interviewType === 'technical' ? 'text-white' : 'text-black'}`}
                  >
                    <Code2 className="w-4 h-4" /> 
                    Technical
                  </button>
                  <button 
                    onClick={() => setInterviewType('hr')}
                    className={`w-1/3 flex items-center justify-center gap-2 transition-colors duration-300 
                      ${interviewType === 'hr' ? 'text-white' : 'text-black'}`}
                  >
                    <Users className="w-4 h-4" />
                    HR
                  </button>
                  <button 
                    onClick={() => setInterviewType('resume')}
                    className={`w-1/3 flex items-center justify-center gap-2 transition-colors duration-300 
                      ${interviewType === 'resume' ? 'text-white' : 'text-black'}`}
                  >
                    <File className="w-4 h-4" />
                    Resume
                  </button>
                </div>
              </div>

              {interviewType === 'technical' && (
                <>
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full stack developer">Full Stack Developer</SelectItem>
                      <SelectItem value="front end developer">Frontend Developer</SelectItem>
                      <SelectItem value="backend developer">Backend Developer</SelectItem>
                      <SelectItem value="python developer">Python Developer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>

                  <Label htmlFor="experience">Experience</Label>
                  <Select value={experience} onValueChange={setExperience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior (0-2)</SelectItem>
                      <SelectItem value="mid">Mid (2–5)</SelectItem>
                      <SelectItem value="senior">Senior (5+)</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              {interviewType === 'hr' && (
                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <Select value={experience} onValueChange={setExperience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior (0-2)</SelectItem>
                      <SelectItem value="mid">Mid (2–5)</SelectItem>
                      <SelectItem value="senior">Senior (5+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {interviewType === 'resume' && (
                <div>
                  <Label htmlFor="resume">Upload Resume</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="resume"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <File className="w-5 h-5" />
                      {resume ? resume.name : "Choose File"}
                    </label>
                    {resume && (
                      <button
                        onClick={handleRemoveResume}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <button 
              onClick={handleStart} 
              disabled={loading || (interviewType === 'resume' && !resume)} // Disable if resume is not uploaded
              className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                  Generating Interview
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" />
                  Start Interview
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddInterview;