"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bookmark, Building, MapPin, GraduationCap, Target, Trash2,
  ChevronRight, BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getReadinessColor, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface SavedJobData {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
    location?: string;
    remoteStatus?: string;
    requiredSkills: string[];
    preferredSkills: string[];
    salary?: { min?: number; max?: number; currency?: string };
    estimatedSalary?: { min?: number; max?: number; currency?: string; isEstimate?: boolean };
    analysis?: { difficulty?: string; competitiveness?: string };
  };
  notes: string;
  readinessScore: number;
  status: string;
  skillProgress: { skill: string; status: string; progress: number }[];
  createdAt: string;
}

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJobData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch("/api/saved-jobs?userId=demo-user");
      const data = await response.json();
      setSavedJobs(data || []);
    } catch {
      console.error("Failed to fetch saved jobs");
    } finally {
      setLoading(false);
    }
  };

  const removeSavedJob = async (id: string) => {
    try {
      await fetch(`/api/saved-jobs/${id}`, { method: "DELETE" });
      setSavedJobs(savedJobs.filter((j) => j._id !== id));
      toast.success("Job removed from saved");
    } catch {
      toast.error("Failed to remove job");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-blue-500" />
          Saved Jobs
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Track your saved positions and monitor readiness
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bookmark className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-medium">No saved jobs</h3>
            <p className="mt-2 text-sm text-gray-500">
              Save interesting jobs to track your progress
            </p>
            <Link href="/jobs">
              <Button className="mt-4">Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((saved, index) => {
            const job = saved.jobId;
            if (!job) return null;
            const allSkills = [...(job.requiredSkills || []), ...(job.preferredSkills || [])];

            return (
              <motion.div
                key={saved._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/jobs/${job._id}`} className="hover:text-blue-600 transition-colors">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                        </Link>
                        <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5" />{job.company}</span>
                          {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getReadinessColor(saved.readinessScore)}`}>
                            {saved.readinessScore}%
                          </p>
                          <p className="text-xs text-gray-400">Readiness</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeSavedJob(saved._id)}>
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </div>

                    <Progress value={saved.readinessScore} className="mt-4" />

                    {/* Skills with Learn buttons */}
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {allSkills.slice(0, 10).map((skill) => (
                          <div key={skill} className="flex items-center gap-1">
                            <Badge variant="secondary">{skill}</Badge>
                            <Link href={`/learning?skill=${encodeURIComponent(skill)}&jobId=${job._id}`}>
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600">
                                <BookOpen className="h-3 w-3 mr-1" />Learn
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex gap-3">
                      <Link href={`/learning?jobId=${job._id}`}>
                        <Button variant="outline" size="sm">
                          <GraduationCap className="mr-2 h-4 w-4" />Learn Skills
                        </Button>
                      </Link>
                      <Link href={`/interview?jobId=${job._id}`}>
                        <Button variant="outline" size="sm">
                          <Target className="mr-2 h-4 w-4" />Interview Plan
                        </Button>
                      </Link>
                      <Link href={`/jobs/${job._id}`}>
                        <Button variant="ghost" size="sm">
                          View Details <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
