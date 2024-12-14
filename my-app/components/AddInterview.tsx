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

export function page() {
  const [open, setOpen] = useState(false)
  const [interviewType, setInterviewType] = useState("technical")
  const [role, setRole] = useState("")
  const [experience, setExperience] = useState("")

  const handleStart = () => {
    console.log("Starting interview:", { interviewType, role, experience })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="p-10 hover:scale-105 shadow-sm cursor-pointer border-none transition-all rounded-lg bg-secondary bg-opacity-80">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <PlusCircle className="w-6 h-6" />
            Add Interview
          </h2>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Configure AI Mock Interview</DialogTitle>
          <DialogDescription>
            Choose the details for your AI-powered mock interview session.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="interview-type">Interview Type</Label>
            <RadioGroup
              id="interview-type"
              value={interviewType}
              onValueChange={setInterviewType}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="technical" id="technical" />
                <Label htmlFor="technical">Technical</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hr" id="hr" />
                <Label htmlFor="hr">HR</Label>
              </div>
            </RadioGroup>
          </div>
          {interviewType === "technical" && (
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react">React Developer</SelectItem>
                  <SelectItem value="python">Python Developer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger id="experience">
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-2">0-2 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="5+">5+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleStart}>Start Interview</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

