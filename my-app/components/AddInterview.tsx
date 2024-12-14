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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle } from 'lucide-react'
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
        <DialogContent>
          <div className="space-y-4">
            <Label>Interview Type</Label>
            <Toggle
              pressed={interviewType === "technical"}
              onPressedChange={() => setInterviewType(interviewType === "technical" ? "hr" : "technical")}
            >
              {interviewType === "technical" ? "Technical" : "HR"}
            </Toggle>

            <Label>Role</Label>
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

            <Label>Experience</Label>
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
          <DialogFooter>
            <button onClick={handleStart} className="btn btn-primary">Start Interview</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddInterview;

