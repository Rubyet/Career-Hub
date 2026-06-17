"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, FileCode, Loader2, Plus, X, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

export default function AnalyzePage() {
  const [urls, setUrls] = useState<string[]>([""]);
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ crawlSessionId: string; jobsFound: number; jobs: Record<string, unknown>[] } | null>(null);

  const addUrl = () => setUrls([...urls, ""]);
  const removeUrl = (index: number) => setUrls(urls.filter((_, i) => i !== index));
  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const analyzeUrls = async () => {
    const validUrls = urls.filter((u) => u.trim());
    if (validUrls.length === 0) {
      toast.error("Please enter at least one URL");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: validUrls, mode: "url" }),
      });
      const data = await response.json();
      if (data.success) {
        setResults(data);
        toast.success(`Found ${data.jobsFound} jobs!`);
      } else {
        toast.error(data.error || "Analysis failed");
      }
    } catch {
      toast.error("Failed to analyze URLs");
    } finally {
      setLoading(false);
    }
  };

  const analyzeHtml = async () => {
    if (!html.trim()) {
      toast.error("Please paste HTML content");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, mode: "html" }),
      });
      const data = await response.json();
      if (data.success) {
        setResults(data);
        toast.success(`Found ${data.jobsFound} jobs!`);
      } else {
        toast.error(data.error || "Analysis failed");
      }
    } catch {
      toast.error("Failed to analyze HTML");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analyze Jobs</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Paste career page URLs or HTML source to discover and analyze job postings
        </p>
      </div>

      <Tabs defaultValue="url" className="w-full">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="url" className="flex-1">
            <Globe className="mr-2 h-4 w-4" />
            Career URL Analysis
          </TabsTrigger>
          <TabsTrigger value="html" className="flex-1">
            <FileCode className="mr-2 h-4 w-4" />
            HTML Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url">
          <Card>
            <CardHeader>
              <CardTitle>Career Page URLs</CardTitle>
              <CardDescription>
                Paste one or more company career page URLs. Supports Greenhouse, Lever,
                Workday, Ashby, BambooHR, and generic career pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {urls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="https://company.com/careers"
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    className="flex-1"
                  />
                  {urls.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeUrl(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex gap-3">
                <Button variant="outline" onClick={addUrl}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add URL
                </Button>
                <Button onClick={analyzeUrls} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze Jobs
                    </>
                  )}
                </Button>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200">Supported platforms:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Greenhouse", "Lever", "Workday", "Ashby", "BambooHR", "Custom career pages"].map(
                    (platform) => (
                      <Badge key={platform} variant="secondary">
                        {platform}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="html">
          <Card>
            <CardHeader>
              <CardTitle>Paste HTML Source</CardTitle>
              <CardDescription>
                For pages protected by login, Cloudflare, anti-bot systems, or dynamic rendering.
                Copy the page source (Ctrl+U or View Source) and paste it here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste the complete HTML source of the career page here..."
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="min-h-[300px] font-mono text-xs"
              />
              <Button onClick={analyzeHtml} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing HTML...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze HTML
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results */}
      {results && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Analysis Results
              </CardTitle>
              <CardDescription>
                Found {results.jobsFound} job postings. AI analysis is processing in the background.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.jobs.map((job: Record<string, unknown>, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium">{job.title as string || "Untitled Position"}</h3>
                      <p className="text-sm text-gray-500">
                        {job.company as string || "Unknown"} • {job.location as string || "Location TBD"}
                      </p>
                    </div>
                    <Link href={`/jobs/${job._id as string}`}>
                      <Button variant="ghost" size="sm">
                        View <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <Link href={`/jobs?crawlSessionId=${results.crawlSessionId}`}>
                  <Button>View All Jobs</Button>
                </Link>
                <Link href={`/analytics?crawlSessionId=${results.crawlSessionId}`}>
                  <Button variant="outline">View Analytics</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
