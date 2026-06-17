"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Brain, Palette, User, Check, Loader2, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface AIStatus {
  healthy: boolean;
  installedModels: string[];
  supportedModels: { name: string; displayName: string; size: string; purpose: string }[];
}

export default function SettingsPage() {
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState({
    jobExtraction: "llama3:8b",
    skillAnalysis: "gemma2:9b",
    learningRoadmap: "qwen3:14b",
    interviewPrep: "qwen3:14b",
  });

  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      const response = await fetch("/api/ai/status");
      const data = await response.json();
      setAiStatus(data);
    } catch {
      setAiStatus({ healthy: false, installedModels: [], supportedModels: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          Settings
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Configure AI models, preferences, and profile
        </p>
      </div>

      <Tabs defaultValue="ai">
        <TabsList>
          <TabsTrigger value="ai"><Brain className="mr-2 h-4 w-4" />AI Configuration</TabsTrigger>
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" />Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-6">
          {/* Ollama Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Ollama Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${aiStatus?.healthy ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <span className="font-medium">{aiStatus?.healthy ? "Connected" : "Not Connected"}</span>
                <Button variant="outline" size="sm" onClick={checkAIStatus}>
                  <Loader2 className={`mr-2 h-3 w-3 ${loading ? "animate-spin" : ""}`} />Refresh
                </Button>
              </div>
              {!aiStatus?.healthy && (
                <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950 p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Ollama is not running. Start it with: <code className="bg-red-100 dark:bg-red-900 px-2 py-0.5 rounded">ollama serve</code>
                  </p>
                </div>
              )}
              {aiStatus?.installedModels && aiStatus.installedModels.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Installed Models</p>
                  <div className="flex flex-wrap gap-2">
                    {aiStatus.installedModels.map((model) => (
                      <Badge key={model} variant="success">{model}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Model Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Model Selection</CardTitle>
              <CardDescription>Choose which model to use for each task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiStatus?.supportedModels?.map((model) => (
                <div key={model.name} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h4 className="font-medium">{model.displayName}</h4>
                    <p className="text-sm text-gray-500">{model.purpose} • {model.size}</p>
                  </div>
                  <Badge variant={aiStatus.installedModels?.includes(model.name) ? "success" : "outline"}>
                    {aiStatus.installedModels?.includes(model.name) ? "Installed" : "Not Installed"}
                  </Badge>
                </div>
              ))}

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Job Extraction</label>
                  <select
                    value={models.jobExtraction}
                    onChange={(e) => setModels({ ...models, jobExtraction: e.target.value })}
                    className="rounded-lg border px-3 py-1.5 text-sm bg-white dark:bg-gray-900"
                  >
                    {aiStatus?.supportedModels?.map((m) => (
                      <option key={m.name} value={m.name}>{m.displayName}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Skill Analysis</label>
                  <select
                    value={models.skillAnalysis}
                    onChange={(e) => setModels({ ...models, skillAnalysis: e.target.value })}
                    className="rounded-lg border px-3 py-1.5 text-sm bg-white dark:bg-gray-900"
                  >
                    {aiStatus?.supportedModels?.map((m) => (
                      <option key={m.name} value={m.name}>{m.displayName}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Learning Roadmaps</label>
                  <select
                    value={models.learningRoadmap}
                    onChange={(e) => setModels({ ...models, learningRoadmap: e.target.value })}
                    className="rounded-lg border px-3 py-1.5 text-sm bg-white dark:bg-gray-900"
                  >
                    {aiStatus?.supportedModels?.map((m) => (
                      <option key={m.name} value={m.name}>{m.displayName}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Interview Preparation</label>
                  <select
                    value={models.interviewPrep}
                    onChange={(e) => setModels({ ...models, interviewPrep: e.target.value })}
                    className="rounded-lg border px-3 py-1.5 text-sm bg-white dark:bg-gray-900"
                  >
                    {aiStatus?.supportedModels?.map((m) => (
                      <option key={m.name} value={m.name}>{m.displayName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button onClick={() => toast.success("Model preferences saved!")}>
                <Check className="mr-2 h-4 w-4" />Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Set your profile for skill gap analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Title</label>
                <Input placeholder="e.g., Software Engineer" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Years of Experience</label>
                <Input type="number" placeholder="3" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Education</label>
                <Input placeholder="e.g., BS Computer Science" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Your Skills (comma separated)</label>
                <Input placeholder="React, TypeScript, Node.js, AWS" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Resume Text (paste for AI analysis)</label>
                <textarea
                  placeholder="Paste your resume content here..."
                  className="mt-1 w-full min-h-[150px] rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <Button onClick={() => toast.success("Profile saved!")}>
                <Check className="mr-2 h-4 w-4" />Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Theme is controlled by the toggle in the header. The app supports Light, Dark, and System modes.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border-2 border-blue-500 p-4 text-center cursor-pointer">
                  <div className="h-8 w-full rounded bg-white border mb-2" />
                  <span className="text-sm font-medium">Light</span>
                </div>
                <div className="rounded-lg border-2 border-gray-300 p-4 text-center cursor-pointer">
                  <div className="h-8 w-full rounded bg-gray-900 mb-2" />
                  <span className="text-sm font-medium">Dark</span>
                </div>
                <div className="rounded-lg border-2 border-gray-300 p-4 text-center cursor-pointer">
                  <div className="h-8 w-full rounded bg-gradient-to-r from-white to-gray-900 mb-2" />
                  <span className="text-sm font-medium">System</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
