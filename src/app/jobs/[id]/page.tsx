"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import {
  Building, MapPin, Calendar, ExternalLink, Bookmark, GraduationCap,
  Target, Briefcase, DollarSign, Star, Shield, TrendingUp, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getDifficultyColor, getCompetitivenessColor, formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Job {
  _id: string;
  title: string;
  company: string;
  department?: string;
  team?: string;
  location?: string;
  country?: string;
  remoteStatus?: string;
  employmentType?: string;
  salary?: { min?: number; max?: number; currency?: string; period?: string };
  estimatedSalary?: { min?: number; max?: number; currency?: string; isEstimate?: boolean; confidence?: string };
  benefits: string[];
  workSchedule?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  qualifications: string[];
  educationRequirements?: string;
  experienceRequirements?: string;
  applicationDeadline?: string;
  jobUrl: string;
  postingDate?: string;
  analysis?: {
    executiveSummary?: string;
    difficulty?: string;
    skillImportance?: { critical: string[]; important: string[]; niceToHave: string[] };
    competitiveness?: string;
    careerGrowth?: { level?: string; reasoning?: string };
  };
  createdAt: string;
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${id}`);
      const data = await response.json();
      setJob(data);
    } catch {
      toast.error("Failed to load job");
    } finally {
      setLoading(false);
    }
  };

  const saveJob = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/saved-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo-user", jobId: id }),
      });
      if (response.ok) {
        toast.success("Job saved!");
      } else if (response.status === 409) {
        toast.info("Job already saved");
      }
    } catch {
      toast.error("Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!job) {
    return <div className="py-20 text-center text-gray-500">Job not found</div>;
  }

  const salaryData = job.salary?.max ? job.salary : job.estimatedSalary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  {job.analysis?.difficulty && (
                    <Badge className={getDifficultyColor(job.analysis.difficulty)}>
                      {job.analysis.difficulty}
                    </Badge>
                  )}
                  {job.analysis?.competitiveness && (
                    <span className={`text-sm font-medium ${getCompetitivenessColor(job.analysis.competitiveness)}`}>
                      {job.analysis.competitiveness}
                    </span>
                  )}
                  {job.remoteStatus && job.remoteStatus !== "Unknown" && (
                    <Badge variant={job.remoteStatus === "Remote" ? "success" : "secondary"}>
                      {job.remoteStatus}
                    </Badge>
                  )}
                </div>
                <h1 className="mt-3 text-3xl font-bold">{job.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-gray-500">
                  <span className="flex items-center gap-1"><Building className="h-4 w-4" />{job.company}</span>
                  {job.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>}
                  {job.employmentType && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.employmentType}</span>}
                  {job.postingDate && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(job.postingDate)}</span>}
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <Button onClick={saveJob} disabled={saving} variant="outline">
                  <Bookmark className="mr-2 h-4 w-4" />Save Job
                </Button>
                <a href={job.jobUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline"><ExternalLink className="mr-2 h-4 w-4" />Original Posting</Button>
                </a>
              </div>
            </div>

            {/* Salary */}
            {salaryData?.max && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 px-4 py-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-lg font-semibold text-green-700 dark:text-green-300">
                  {formatCurrency(salaryData.min || 0, salaryData.currency || "USD")} - {formatCurrency(salaryData.max, salaryData.currency || "USD")}
                </span>
                {job.estimatedSalary?.isEstimate && (
                  <Badge variant="warning" className="ml-2">AI Estimate</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary */}
          {job.analysis?.executiveSummary && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" />Executive Summary</CardTitle></CardHeader>
              <CardContent><p className="text-gray-600 dark:text-gray-300 leading-relaxed">{job.analysis.executiveSummary}</p></CardContent>
            </Card>
          )}

          {/* Responsibilities */}
          {job.responsibilities.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Responsibilities</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />{r}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Qualifications */}
          {job.qualifications.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Qualifications</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.qualifications.map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />{q}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Skill Importance */}
          {job.analysis?.skillImportance && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-500" />Skill Importance Ranking</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {job.analysis.skillImportance.critical?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-600 mb-2">Critical</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.analysis.skillImportance.critical.map((s) => (<Badge key={s} variant="destructive">{s}</Badge>))}
                    </div>
                  </div>
                )}
                {job.analysis.skillImportance.important?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-600 mb-2">Important</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.analysis.skillImportance.important.map((s) => (<Badge key={s} variant="warning">{s}</Badge>))}
                    </div>
                  </div>
                )}
                {job.analysis.skillImportance.niceToHave?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-green-600 mb-2">Nice to Have</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.analysis.skillImportance.niceToHave.map((s) => (<Badge key={s} variant="success">{s}</Badge>))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <Button className="w-full" onClick={saveJob} disabled={saving}>
                <Bookmark className="mr-2 h-4 w-4" />Save Job
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href={`/learning?jobId=${id}`}><GraduationCap className="mr-2 h-4 w-4" />Learn Skills</a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href={`/interview?jobId=${id}`}><Target className="mr-2 h-4 w-4" />Interview Plan</a>
              </Button>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader><CardTitle className="text-base">Required Skills</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="default">{skill}</Badge>
                ))}
              </div>
              {job.preferredSkills.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <p className="text-xs font-medium text-gray-500 mb-2">Preferred</p>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredSkills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          {job.benefits.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Benefits</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {job.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Shield className="h-3.5 w-3.5 text-green-500 shrink-0" />{b}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Career Growth */}
          {job.analysis?.careerGrowth && (
            <Card>
              <CardHeader><CardTitle className="text-base">Career Growth</CardTitle></CardHeader>
              <CardContent>
                <Badge variant={job.analysis.careerGrowth.level === "High" ? "success" : job.analysis.careerGrowth.level === "Medium" ? "warning" : "secondary"}>
                  {job.analysis.careerGrowth.level} Growth Potential
                </Badge>
                {job.analysis.careerGrowth.reasoning && (
                  <p className="mt-2 text-sm text-gray-500">{job.analysis.careerGrowth.reasoning}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {job.department && <div className="flex justify-between"><span className="text-gray-500">Department</span><span>{job.department}</span></div>}
              {job.team && <div className="flex justify-between"><span className="text-gray-500">Team</span><span>{job.team}</span></div>}
              {job.educationRequirements && <div className="flex justify-between"><span className="text-gray-500">Education</span><span>{job.educationRequirements}</span></div>}
              {job.experienceRequirements && <div className="flex justify-between"><span className="text-gray-500">Experience</span><span>{job.experienceRequirements}</span></div>}
              {job.workSchedule && <div className="flex justify-between"><span className="text-gray-500">Schedule</span><span>{job.workSchedule}</span></div>}
              {job.applicationDeadline && <div className="flex justify-between"><span className="text-gray-500">Deadline</span><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(job.applicationDeadline)}</span></div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
