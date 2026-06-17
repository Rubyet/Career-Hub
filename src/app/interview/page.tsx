"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Target, Calendar, BookOpen, Award, FileText, AlertTriangle,
  CheckCircle2, Loader2, Briefcase, Shield, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface InterviewPlanData {
  _id: string;
  jobTitle: string;
  company: string;
  plan30Day?: { week: number; focus: string; tasks: string[]; milestones: string[] }[];
  plan60Day?: { week: number; focus: string; tasks: string[]; milestones: string[] }[];
  plan90Day?: { week: number; focus: string; tasks: string[]; milestones: string[] }[];
  requiredProjects?: { title: string; description: string; skills: string[]; estimatedTime: string }[];
  certifications?: { name: string; provider: string; relevance: string; estimatedTime: string }[];
  resumeOptimization?: { missingSkills: string[]; suggestions: string[]; keywordImprovements: string[] };
  riskAnalysis?: { weakAreas: string[]; missingExperience: string[]; missingSkills: string[]; improvements: string[] };
  skillGap?: { missingSkills: string[]; missingProjects: string[]; missingExperience: string[]; readinessScore: number };
  mockInterviews?: { type: string; questions: { question: string; expectedAnswer: string; tips: string[] }[] }[];
  progress: number;
  status: string;
}

function InterviewContent() {
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<InterviewPlanData[]>([]);
  const [activePlan, setActivePlan] = useState<InterviewPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const jobId = searchParams.get("jobId");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/interview?userId=demo-user");
      const data = await response.json();
      setPlans(data || []);
      if (data?.length > 0) setActivePlan(data[0]);
    } catch {
      console.error("Failed to fetch interview plans");
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    if (!jobId) {
      toast.error("Select a job first to generate an interview plan");
      return;
    }
    setGenerating(true);
    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo-user", jobId }),
      });
      const data = await response.json();
      if (data._id) {
        setPlans((prev) => [data, ...prev]);
        setActivePlan(data);
        toast.success("Interview plan generated!");
      }
    } catch {
      toast.error("Failed to generate plan. Make sure Ollama is running.");
    } finally {
      setGenerating(false);
    }
  };

  const renderWeekPlan = (weeks: { week: number; focus: string; tasks: string[]; milestones: string[] }[]) => (
    <div className="space-y-4">
      {weeks?.map((week) => (
        <Card key={week.week}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Week {week.week}: {week.focus}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400 mb-1">Tasks</p>
              <ul className="space-y-1">
                {week.tasks?.map((task, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-gray-300 mt-0.5 shrink-0" />{task}
                  </li>
                ))}
              </ul>
            </div>
            {week.milestones?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400 mb-1">Milestones</p>
                <div className="flex flex-wrap gap-1.5">
                  {week.milestones.map((m, i) => (<Badge key={i} variant="success" className="text-xs">{m}</Badge>))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-red-500" />
            Interview Success Planner
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Personalized interview preparation roadmaps
          </p>
        </div>
        {jobId && (
          <Button onClick={generatePlan} disabled={generating}>
            {generating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
            ) : (
              <><Target className="mr-2 h-4 w-4" />Generate Plan</>
            )}
          </Button>
        )}
      </div>

      {plans.length === 0 && !loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-medium">No interview plans yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Save a job and click &quot;Interview Plan&quot; to generate a personalized preparation roadmap
            </p>
          </CardContent>
        </Card>
      ) : activePlan ? (
        <div>
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{activePlan.jobTitle}</h2>
                  <p className="text-gray-500">{activePlan.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">{activePlan.skillGap?.readinessScore || 0}%</p>
                  <p className="text-xs text-gray-400">Readiness Score</p>
                </div>
              </div>
              <Progress value={activePlan.skillGap?.readinessScore || 0} className="mt-4" />
            </CardContent>
          </Card>

          <Tabs defaultValue="30day">
            <TabsList className="flex-wrap">
              <TabsTrigger value="30day">30-Day Plan</TabsTrigger>
              <TabsTrigger value="60day">60-Day Plan</TabsTrigger>
              <TabsTrigger value="90day">90-Day Plan</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="certs">Certifications</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
              <TabsTrigger value="mock">Mock Interview</TabsTrigger>
            </TabsList>

            <TabsContent value="30day">{renderWeekPlan(activePlan.plan30Day || [])}</TabsContent>
            <TabsContent value="60day">{renderWeekPlan(activePlan.plan60Day || [])}</TabsContent>
            <TabsContent value="90day">{renderWeekPlan(activePlan.plan90Day || [])}</TabsContent>

            <TabsContent value="projects" className="space-y-4">
              {activePlan.requiredProjects?.map((project, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-base">{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {project.skills?.map((s) => (<Badge key={s} variant="secondary">{s}</Badge>))}
                    </div>
                    <Badge variant="outline">{project.estimatedTime}</Badge>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="certs" className="space-y-4">
              {activePlan.certifications?.map((cert, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Award className="h-8 w-8 text-yellow-500 shrink-0" />
                      <div>
                        <h4 className="font-semibold">{cert.name}</h4>
                        <p className="text-sm text-gray-500">{cert.provider}</p>
                        <p className="mt-1 text-sm">{cert.relevance}</p>
                        <Badge variant="outline" className="mt-2">{cert.estimatedTime}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="resume" className="space-y-4">
              {activePlan.resumeOptimization && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Resume Optimization</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {activePlan.resumeOptimization.missingSkills?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-600 mb-2">Missing Skills</p>
                        <div className="flex flex-wrap gap-2">{activePlan.resumeOptimization.missingSkills.map((s) => (<Badge key={s} variant="destructive">{s}</Badge>))}</div>
                      </div>
                    )}
                    {activePlan.resumeOptimization.suggestions?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-blue-600 mb-2">Suggestions</p>
                        <ul className="space-y-1">{activePlan.resumeOptimization.suggestions.map((s, i) => (<li key={i} className="text-sm flex items-start gap-2"><TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />{s}</li>))}</ul>
                      </div>
                    )}
                    {activePlan.resumeOptimization.keywordImprovements?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-green-600 mb-2">Keyword Improvements</p>
                        <div className="flex flex-wrap gap-2">{activePlan.resumeOptimization.keywordImprovements.map((k) => (<Badge key={k} variant="success">{k}</Badge>))}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="risk" className="space-y-4">
              {activePlan.riskAnalysis && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500" />Risk Analysis</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {activePlan.riskAnalysis.weakAreas?.length > 0 && (
                      <div><p className="text-sm font-medium text-red-600 mb-1">Weak Areas</p><ul className="space-y-1">{activePlan.riskAnalysis.weakAreas.map((a, i) => (<li key={i} className="text-sm">• {a}</li>))}</ul></div>
                    )}
                    {activePlan.riskAnalysis.improvements?.length > 0 && (
                      <div><p className="text-sm font-medium text-green-600 mb-1">Improvements</p><ul className="space-y-1">{activePlan.riskAnalysis.improvements.map((a, i) => (<li key={i} className="text-sm flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />{a}</li>))}</ul></div>
                    )}
                  </CardContent>
                </Card>
              )}
              {activePlan.skillGap && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-blue-500" />Skill Gap Analysis</CardTitle></CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Readiness Score</span>
                        <span className="font-bold">{activePlan.skillGap.readinessScore}%</span>
                      </div>
                      <Progress value={activePlan.skillGap.readinessScore} />
                    </div>
                    {activePlan.skillGap.missingSkills?.length > 0 && (
                      <div className="mb-3"><p className="text-sm font-medium mb-1">Missing Skills</p><div className="flex flex-wrap gap-1.5">{activePlan.skillGap.missingSkills.map((s) => (<Badge key={s} variant="destructive" className="text-xs">{s}</Badge>))}</div></div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="mock" className="space-y-4">
              {activePlan.mockInterviews?.map((mock, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-base capitalize flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {mock.type} Interview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="multiple">
                      {mock.questions?.map((q, j) => (
                        <AccordionItem key={j} value={`mock-${i}-${j}`}>
                          <AccordionTrigger className="text-sm text-left">{q.question}</AccordionTrigger>
                          <AccordionContent className="space-y-2">
                            <div><p className="text-xs font-semibold text-green-600">Expected Answer</p><p className="text-sm">{q.expectedAnswer}</p></div>
                            {q.tips?.length > 0 && (
                              <div><p className="text-xs font-semibold text-blue-600">Tips</p><ul className="space-y-1">{q.tips.map((t, k) => (<li key={k} className="text-sm">• {t}</li>))}</ul></div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
              {(!activePlan.mockInterviews || activePlan.mockInterviews.length === 0) && (
                <Card><CardContent className="p-8 text-center text-gray-400">No mock interviews available yet.</CardContent></Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>}>
      <InterviewContent />
    </Suspense>
  );
}
