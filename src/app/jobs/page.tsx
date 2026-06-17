"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, Building, Filter, Briefcase, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getDifficultyColor, getCompetitivenessColor, formatCurrency } from "@/lib/utils";

interface Job {
  _id: string;
  title: string;
  company: string;
  location?: string;
  remoteStatus?: string;
  employmentType?: string;
  salary?: { min?: number; max?: number; currency?: string };
  estimatedSalary?: { min?: number; max?: number; currency?: string; isEstimate?: boolean };
  requiredSkills: string[];
  analysis?: {
    difficulty?: string;
    competitiveness?: string;
    executiveSummary?: string;
  };
  status: string;
  createdAt: string;
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>}>
      <JobsContent />
    </Suspense>
  );
}

function JobsContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchJobs();
  }, [page, searchParams]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.set("search", search);
      const crawlSessionId = searchParams.get("crawlSessionId");
      if (crawlSessionId) params.set("crawlSessionId", crawlSessionId);

      const response = await fetch(`/api/jobs?${params}`);
      const data = await response.json();
      setJobs(data.jobs || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch {
      console.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const getSalaryDisplay = (job: Job) => {
    const sal = job.salary?.max ? job.salary : job.estimatedSalary;
    if (!sal?.max) return null;
    const label = job.estimatedSalary?.isEstimate ? " (est.)" : "";
    return `${formatCurrency(sal.min || 0, sal.currency || "USD")} - ${formatCurrency(sal.max, sal.currency || "USD")}${label}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Jobs</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Browse and filter discovered job postings
          </p>
        </div>
        <Link href="/analyze">
          <Button><Search className="mr-2 h-4 w-4" />Analyze New</Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by title, company, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline"><Filter className="mr-2 h-4 w-4" />Filter</Button>
      </form>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-64 mb-2" />
                <Skeleton className="h-4 w-48 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-medium">No jobs found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Analyze a career page to discover job postings
            </p>
            <Link href="/analyze">
              <Button className="mt-4">Analyze Career Page</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/jobs/${job._id}`}>
                <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Building className="h-3.5 w-3.5" />{job.company}
                          </span>
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />{job.location}
                            </span>
                          )}
                          {job.remoteStatus && job.remoteStatus !== "Unknown" && (
                            <Badge variant={job.remoteStatus === "Remote" ? "success" : "secondary"}>
                              {job.remoteStatus}
                            </Badge>
                          )}
                          {job.employmentType && (
                            <Badge variant="outline">{job.employmentType}</Badge>
                          )}
                        </div>
                        {job.analysis?.executiveSummary && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {job.analysis.executiveSummary}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {job.requiredSkills.slice(0, 6).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.requiredSkills.length > 6 && (
                            <Badge variant="secondary" className="text-xs">
                              +{job.requiredSkills.length - 6}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 text-right shrink-0">
                        {job.analysis?.difficulty && (
                          <Badge className={getDifficultyColor(job.analysis.difficulty)}>
                            {job.analysis.difficulty}
                          </Badge>
                        )}
                        {getSalaryDisplay(job) && (
                          <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                            {getSalaryDisplay(job)}
                          </p>
                        )}
                        <ExternalLink className="mt-2 h-4 w-4 text-gray-300 ml-auto" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
