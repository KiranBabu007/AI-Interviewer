"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from 'lucide-react';
import { Toggle } from "@/components/ui/toggle";

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
          <button className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5" />
            <span>Add Interview</span>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-black text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">Configure AI Mock Interview</DialogTitle>
            <DialogDescription>
              Choose the details for your AI-powered mock interview session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="interview-type">Interview Type</Label>
              <Toggle
                pressed={interviewType === "technical"}
                onPressedChange={() => setInterviewType(interviewType === "technical" ? "hr" : "technical")}
              >
                {interviewType === "technical" ? "Technical" : "HR"}
              </Toggle>

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
            </div>
          </div>
          <DialogFooter>
            <button onClick={handleStart} className="btn btn-primary">Start Interview</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddInterview;

