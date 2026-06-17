"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { BarChart3, TrendingUp, DollarSign, Heart, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];

interface AnalyticsData {
  totalJobsFound: number;
  totalJobsProcessed: number;
  positionAnalysis?: {
    commonRoles: { name: string; count: number }[];
    departmentDistribution: { name: string; count: number }[];
    seniorityDistribution: { name: string; count: number }[];
  };
  skillAnalysis?: {
    topSkills: { name: string; count: number }[];
    skillFrequency: { name: string; percentage: number }[];
    emergingTechnologies: string[];
  };
  salaryAnalysis?: {
    average: number;
    highest: number;
    lowest: number;
    byRole: { role: string; average: number }[];
    currency: string;
  };
  benefitsAnalysis?: {
    commonBenefits: { name: string; count: number }[];
    remoteWorkFrequency: number;
  };
}

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [searchParams]);

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams();
      const crawlSessionId = searchParams.get("crawlSessionId");
      if (crawlSessionId) params.set("crawlSessionId", crawlSessionId);
      const response = await fetch(`/api/analytics?${params}`);
      const result = await response.json();
      setData(result);
    } catch {
      console.error("Failed to fetch analytics");
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

  if (!data || !data.totalJobsFound) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-500" />
          Analytics Dashboard
        </h1>
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-medium">No analytics data yet</h3>
            <p className="mt-2 text-sm text-gray-500">Analyze some career pages to generate analytics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: data.salaryAnalysis?.currency || "USD", maximumFractionDigits: 0 }).format(value);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-500" />
          Analytics Dashboard
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Insights from {data.totalJobsFound} analyzed job postings
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Briefcase className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{data.totalJobsFound}</p>
                <p className="text-sm text-gray-500">Total Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{data.skillAnalysis?.topSkills?.length || 0}</p>
                <p className="text-sm text-gray-500">Unique Skills</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{data.salaryAnalysis?.average ? formatCurrency(data.salaryAnalysis.average) : "N/A"}</p>
                <p className="text-sm text-gray-500">Avg Salary</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{data.benefitsAnalysis?.remoteWorkFrequency || 0}%</p>
                <p className="text-sm text-gray-500">Remote Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="positions">
        <TabsList>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Most Common Roles</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.positionAnalysis?.commonRoles?.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Seniority Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={data.positionAnalysis?.seniorityDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {data.positionAnalysis?.seniorityDistribution?.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          {data.positionAnalysis?.departmentDistribution && data.positionAnalysis.departmentDistribution.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Department Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.positionAnalysis.departmentDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Top Requested Skills</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.skillAnalysis?.topSkills?.slice(0, 15)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Skill Demand Frequency</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.skillAnalysis?.skillFrequency?.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                  <YAxis unit="%" />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-500">Average</p>
                <p className="text-2xl font-bold text-green-600">{data.salaryAnalysis?.average ? formatCurrency(data.salaryAnalysis.average) : "N/A"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-500">Highest</p>
                <p className="text-2xl font-bold text-blue-600">{data.salaryAnalysis?.highest ? formatCurrency(data.salaryAnalysis.highest) : "N/A"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-500">Lowest</p>
                <p className="text-2xl font-bold text-orange-600">{data.salaryAnalysis?.lowest ? formatCurrency(data.salaryAnalysis.lowest) : "N/A"}</p>
              </CardContent>
            </Card>
          </div>
          {data.salaryAnalysis?.byRole && data.salaryAnalysis.byRole.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Salary by Role</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.salaryAnalysis.byRole}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="role" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="average" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Most Common Benefits</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.benefitsAnalysis?.commonBenefits?.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-blue-600">{data.benefitsAnalysis?.remoteWorkFrequency || 0}%</div>
                <div><p className="font-medium">Remote Work Frequency</p><p className="text-sm text-gray-500">Percentage of jobs offering remote work</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
