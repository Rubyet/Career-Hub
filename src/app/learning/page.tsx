"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  GraduationCap, BookOpen, Code, Lightbulb, Rocket, Trophy,
  CheckCircle2, Circle, Loader2, ChevronDown, ChevronRight,
  FileText, ExternalLink, Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface LearningPlanData {
  _id: string;
  skill: string;
  overview?: {
    whatItIs?: string;
    whyCompaniesNeedIt?: string;
    realWorldUsage?: string;
  };
  roadmap?: {
    beginner?: { concepts?: string[]; duration?: string };
    intermediate?: { projects?: string[]; duration?: string };
    advanced?: { topics?: string[]; duration?: string };
    expert?: { interviewMastery?: string[]; duration?: string };
  };
  resources?: {
    documentation?: string[];
    books?: string[];
    tutorials?: string[];
    openSourceProjects?: string[];
    githubRepos?: string[];
    practiceWebsites?: string[];
  };
  projects?: {
    level: string;
    title: string;
    goal: string;
    features: string[];
    deliverables: string[];
    skillsLearned: string[];
  }[];
  interviewQuestions?: {
    level: string;
    question: string;
    answer: string;
    explanation: string;
    commonMistakes: string[];
  }[];
  practicalChallenges?: {
    type: string;
    title: string;
    description: string;
    difficulty: string;
  }[];
  progress: number;
  status: string;
  createdAt: string;
}

function LearningContent() {
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<LearningPlanData[]>([]);
  const [activePlan, setActivePlan] = useState<LearningPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [skillInput, setSkillInput] = useState(searchParams.get("skill") || "");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/learning?userId=demo-user");
      const data = await response.json();
      setPlans(data || []);
      if (data?.length > 0) setActivePlan(data[0]);
    } catch {
      console.error("Failed to fetch learning plans");
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async (skill: string) => {
    if (!skill.trim()) {
      toast.error("Enter a skill name");
      return;
    }
    setGenerating(true);
    try {
      const response = await fetch("/api/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          skill: skill.trim(),
          jobContext: searchParams.get("jobId") || undefined,
        }),
      });
      const data = await response.json();
      if (data._id) {
        setPlans((prev) => [data, ...prev]);
        setActivePlan(data);
        setSkillInput("");
        toast.success(`Learning plan created for ${skill}!`);
      }
    } catch {
      toast.error("Failed to generate learning plan. Make sure Ollama is running.");
    } finally {
      setGenerating(false);
    }
  };

  const roadmapLevels = [
    { key: "beginner", label: "Beginner", icon: Lightbulb, color: "text-green-500", field: "concepts" },
    { key: "intermediate", label: "Intermediate", icon: Code, color: "text-blue-500", field: "projects" },
    { key: "advanced", label: "Advanced", icon: Rocket, color: "text-purple-500", field: "topics" },
    { key: "expert", label: "Expert", icon: Trophy, color: "text-orange-500", field: "interviewMastery" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-indigo-500" />
          Learning Center
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Generate AI-powered learning roadmaps for any skill
        </p>
      </div>

      {/* Generate new plan */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Input
              placeholder="Enter a skill to learn (e.g., React, AWS, System Design)..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generatePlan(skillInput)}
              className="flex-1"
            />
            <Button onClick={() => generatePlan(skillInput)} disabled={generating}>
              {generating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
              ) : (
                <><GraduationCap className="mr-2 h-4 w-4" />Generate Roadmap</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Plan List */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 px-1">Your Learning Plans</p>
          {plans.length === 0 && !loading ? (
            <Card>
              <CardContent className="p-4 text-center text-sm text-gray-400">
                No plans yet. Generate one above!
              </CardContent>
            </Card>
          ) : (
            plans.map((plan) => (
              <Card
                key={plan._id}
                className={`cursor-pointer transition-all ${activePlan?._id === plan._id ? "border-blue-500 shadow-md" : "hover:border-gray-300"}`}
                onClick={() => setActivePlan(plan)}
              >
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm">{plan.skill}</h4>
                  <Progress value={plan.progress} className="mt-2 h-1.5" />
                  <p className="mt-1 text-xs text-gray-400">{plan.progress}% complete</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Active Plan Detail */}
        <div className="lg:col-span-3">
          {activePlan ? (
            <Tabs defaultValue="overview">
              <TabsList className="w-full flex-wrap">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="interview">Interview Prep</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="challenges">Challenges</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{activePlan.skill} Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activePlan.overview?.whatItIs && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">What it is</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{activePlan.overview.whatItIs}</p>
                      </div>
                    )}
                    {activePlan.overview?.whyCompaniesNeedIt && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Why companies need it</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{activePlan.overview.whyCompaniesNeedIt}</p>
                      </div>
                    )}
                    {activePlan.overview?.realWorldUsage && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Real-world usage</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{activePlan.overview.realWorldUsage}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="roadmap" className="space-y-4">
                {roadmapLevels.map((level) => {
                  const data = activePlan.roadmap?.[level.key as keyof typeof activePlan.roadmap];
                  if (!data) return null;
                  const items = (data as Record<string, unknown>)[level.field] as string[] | undefined;
                  return (
                    <Card key={level.key}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <level.icon className={`h-5 w-5 ${level.color}`} />
                          {level.label}
                          {data.duration && <Badge variant="secondary" className="ml-auto">{data.duration}</Badge>}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {items?.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Circle className="h-4 w-4 mt-0.5 text-gray-300 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                {activePlan.projects?.map((project, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{project.title}</CardTitle>
                        <Badge variant={
                          project.level === "Beginner" ? "success" :
                          project.level === "Intermediate" ? "default" :
                          project.level === "Advanced" ? "warning" : "destructive"
                        }>{project.level}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div><p className="text-sm font-medium">Goal</p><p className="text-sm text-gray-600 dark:text-gray-300">{project.goal}</p></div>
                      {project.features?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Features</p>
                          <ul className="space-y-1">{project.features.map((f, j) => (<li key={j} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />{f}</li>))}</ul>
                        </div>
                      )}
                      {project.skillsLearned?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">{project.skillsLearned.map((s) => (<Badge key={s} variant="secondary" className="text-xs">{s}</Badge>))}</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {(!activePlan.projects || activePlan.projects.length === 0) && (
                  <Card><CardContent className="p-8 text-center text-gray-400">No projects available for this plan yet.</CardContent></Card>
                )}
              </TabsContent>

              <TabsContent value="interview" className="space-y-4">
                <Accordion type="multiple" className="space-y-2">
                  {activePlan.interviewQuestions?.map((q, i) => (
                    <AccordionItem key={i} value={`q-${i}`} className="rounded-lg border px-4">
                      <AccordionTrigger className="text-sm">
                        <div className="flex items-center gap-2 text-left">
                          <Badge variant={
                            q.level === "Beginner" ? "success" :
                            q.level === "Intermediate" ? "default" :
                            q.level === "Advanced" ? "warning" : "destructive"
                          } className="shrink-0">{q.level}</Badge>
                          {q.question}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <div><p className="text-sm font-medium text-green-600">Answer</p><p className="text-sm">{q.answer}</p></div>
                        <div><p className="text-sm font-medium text-blue-600">Explanation</p><p className="text-sm">{q.explanation}</p></div>
                        {q.commonMistakes?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-red-600">Common Mistakes</p>
                            <ul className="space-y-1 mt-1">{q.commonMistakes.map((m, j) => (<li key={j} className="text-sm text-gray-600 dark:text-gray-300">• {m}</li>))}</ul>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {(!activePlan.interviewQuestions || activePlan.interviewQuestions.length === 0) && (
                  <Card><CardContent className="p-8 text-center text-gray-400">No interview questions available yet.</CardContent></Card>
                )}
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    {activePlan.resources?.documentation && activePlan.resources.documentation.length > 0 && (
                      <div><h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><FileText className="h-4 w-4" />Documentation</h4><ul className="space-y-1">{activePlan.resources.documentation.map((r, i) => (<li key={i} className="text-sm text-blue-600 dark:text-blue-400">{r}</li>))}</ul></div>
                    )}
                    {activePlan.resources?.books && activePlan.resources.books.length > 0 && (
                      <div><h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><BookOpen className="h-4 w-4" />Books</h4><ul className="space-y-1">{activePlan.resources.books.map((r, i) => (<li key={i} className="text-sm">{r}</li>))}</ul></div>
                    )}
                    {activePlan.resources?.tutorials && activePlan.resources.tutorials.length > 0 && (
                      <div><h4 className="text-sm font-semibold mb-2">Tutorials</h4><ul className="space-y-1">{activePlan.resources.tutorials.map((r, i) => (<li key={i} className="text-sm">{r}</li>))}</ul></div>
                    )}
                    {activePlan.resources?.practiceWebsites && activePlan.resources.practiceWebsites.length > 0 && (
                      <div><h4 className="text-sm font-semibold mb-2">Practice Websites</h4><ul className="space-y-1">{activePlan.resources.practiceWebsites.map((r, i) => (<li key={i} className="text-sm">{r}</li>))}</ul></div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="challenges" className="space-y-4">
                {activePlan.practicalChallenges?.map((challenge, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Wrench className="h-4 w-4" />{challenge.title}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{challenge.type}</Badge>
                          <Badge variant={challenge.difficulty === "hard" ? "destructive" : challenge.difficulty === "medium" ? "warning" : "success"}>{challenge.difficulty}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent><p className="text-sm text-gray-600 dark:text-gray-300">{challenge.description}</p></CardContent>
                  </Card>
                ))}
                {(!activePlan.practicalChallenges || activePlan.practicalChallenges.length === 0) && (
                  <Card><CardContent className="p-8 text-center text-gray-400">No challenges available yet.</CardContent></Card>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <GraduationCap className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                <h3 className="mt-4 text-lg font-medium">Select or create a learning plan</h3>
                <p className="mt-2 text-sm text-gray-500">Enter a skill above to generate a comprehensive learning roadmap</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LearningPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>}>
      <LearningContent />
    </Suspense>
  );
}
