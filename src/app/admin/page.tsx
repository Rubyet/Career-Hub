"use client";

import { useState, useEffect } from "react";
import { Shield, Users, Briefcase, Bookmark, Activity, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface AdminStats {
  users: number;
  jobs: number;
  savedJobs: number;
  recentJobs: { _id: string; title: string; company: string; status: string; createdAt: string }[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      setStats(data);
    } catch {
      console.error("Failed to fetch admin stats");
    } finally {
      setLoading(false);
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
          <Shield className="h-6 w-6 text-purple-500" />
          Admin Panel
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Monitor system health and usage
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.users || 0}</p>
                <p className="text-sm text-gray-500">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Briefcase className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.jobs || 0}</p>
                <p className="text-sm text-gray-500">Total Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Bookmark className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.savedJobs || 0}</p>
                <p className="text-sm text-gray-500">Saved Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Job Processing
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentJobs && stats.recentJobs.length > 0 ? (
            <div className="space-y-3">
              {stats.recentJobs.map((job) => (
                <div key={job._id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h4 className="font-medium text-sm">{job.title}</h4>
                    <p className="text-xs text-gray-500">{job.company}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={job.status === "completed" ? "success" : job.status === "processing" ? "warning" : "secondary"}>
                      {job.status}
                    </Badge>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />{formatDate(job.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <p className="text-sm">No recent jobs processed</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Platform</span><span>Next.js + MongoDB</span></div>
          <div className="flex justify-between"><span className="text-gray-500">AI Provider</span><span>Ollama (Local)</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Database</span><span>MongoDB</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Crawler</span><span>Cheerio + Fetch</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
