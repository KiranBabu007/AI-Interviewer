"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { PlusCircle } from 'lucide-react'
import { Toggle } from "@/components/ui/toggle"


const AddInterview = () => {
  const [open, setOpen] = useState(false);
  const [interviewType, setInterviewType] = useState("technical");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  

  const handleStart = () => {
    console.log("Starting interview:", { interviewType, role, experience });
    setOpen(false);
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
              <div className="relative w-60 h-8 bg-white rounded-md border-black ">
                <div 
                  className={`absolute top-0 left-0 w-1/2 h-full bg-black transition-all duration-300 ease-in-out 
                    ${interviewType === 'hr' ? 'translate-x-full' : ''}`}
                />
                
                <div className="relative z-10 flex h-full">
                  <button 
                    onClick={() => setInterviewType('technical')}
                    className={`w-1/2 border-none flex items-center justify-center transition-colors duration-300 
                      ${interviewType === 'technical' ? 'text-white' : 'text-black'}`}
                  >
                    Technical
                  </button>
                  <button 
                    onClick={() => setInterviewType('hr')}
                    className={`w-1/2 border-none flex items-center justify-center transition-colors duration-300 
                      ${interviewType === 'hr' ? 'text-white' : 'text-black'}`}
                  >
                    HR
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
                      <SelectItem value="developer">Developer</SelectItem>
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
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
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
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <button onClick={handleStart} className="btn btn-primary rounded p-2 bg-black text-white">Start Interview</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddInterview;

