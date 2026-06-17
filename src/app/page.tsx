"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  BookOpen,
  Target,
  Flame,
  ArrowRight,
  Globe,
  FileCode,
  Sparkles,
  Zap,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const stats = [
  { title: "Jobs Analyzed", value: "0", change: "Start analyzing", icon: Briefcase, color: "from-blue-500 to-blue-600" },
  { title: "Skills Tracking", value: "0", change: "Add skills", icon: TrendingUp, color: "from-green-500 to-emerald-600" },
  { title: "Learning Plans", value: "0", change: "Create plans", icon: BookOpen, color: "from-purple-500 to-violet-600" },
  { title: "Interview Plans", value: "0", change: "Get prepared", icon: Target, color: "from-orange-500 to-red-500" },
];

const features = [
  { title: "Analyze Career Pages", description: "Paste URLs from any company career page and discover all open positions", icon: Globe, href: "/analyze", color: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300" },
  { title: "Paste HTML Source", description: "For protected pages, paste the HTML source code for direct analysis", icon: FileCode, href: "/analyze", color: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300" },
  { title: "AI Job Analysis", description: "Get executive summaries, difficulty ratings, and competitiveness scores", icon: Sparkles, href: "/jobs", color: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" },
  { title: "Skill Gap Analysis", description: "Compare your profile against job requirements and get readiness scores", icon: Zap, href: "/saved", color: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300" },
  { title: "Learning Roadmaps", description: "AI-generated learning paths with projects, resources, and interview questions", icon: GraduationCap, href: "/learning", color: "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300" },
  { title: "Analytics Dashboard", description: "Visualize hiring trends, skill demand, salary ranges, and benefit analysis", icon: BarChart3, href: "/analytics", color: "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300" },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">Welcome to Career Intelligence Hub</h1>
          <p className="mt-2 text-blue-100 max-w-2xl">Discover opportunities, analyze requirements, build skills, and prepare for interviews — all powered by local AI models running on your machine.</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link href="/analyze">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg"><Globe className="mr-2 h-5 w-5" />Analyze Career Page</Button>
            </Link>
            <Link href="/jobs">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">Browse Jobs<ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                    <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                    <p className="mt-1 text-xs text-gray-400">{stat.change}</p>
                  </div>
                  <div className={`rounded-xl bg-gradient-to-r ${stat.color} p-3 text-white shadow-lg`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Get Started</h2>
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <motion.div key={feature.title} variants={item}>
              <Link href={feature.href}>
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className={`inline-flex rounded-xl p-3 ${feature.color}`}><feature.icon className="h-6 w-6" /></div>
                    <h3 className="mt-4 text-lg font-semibold group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-orange-500" />Study Streak</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-6xl font-bold text-orange-500">0</p>
              <p className="mt-2 text-gray-500">days</p>
              <p className="mt-4 text-sm text-gray-400">Start learning skills to build your streak!</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-blue-500" />Overall Readiness</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4 py-4">
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Technical Skills</span><span className="font-medium">0%</span></div>
                <Progress value={0} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Interview Readiness</span><span className="font-medium">0%</span></div>
                <Progress value={0} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Project Portfolio</span><span className="font-medium">0%</span></div>
                <Progress value={0} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
