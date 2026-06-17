import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import dbConnect from "@/lib/db";
import Job from "@/models/Job";
import Analytics from "@/models/Analytics";
import { crawlUrl, parseHtml, extractJobPostings } from "@/lib/crawler";
import { extractJobData, analyzeJob } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { urls, html, mode } = body;

    const crawlSessionId = crypto.randomUUID();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allJobs: any[] = [];

    if (mode === "html" && html) {
      // Direct HTML analysis
      const jobPostings = extractJobPostings(html, "direct-paste");
      for (const posting of jobPostings) {
        try {
          const extracted = await extractJobData(posting.html || posting.text);
          const job = await Job.create({
            ...extracted,
            title: (extracted.title as string) || posting.title,
            jobUrl: posting.url,
            sourceUrl: "direct-paste",
            originalHtml: posting.html,
            extractedText: posting.text,
            crawlSessionId,
            status: "processing",
          });
          allJobs.push(job.toObject());
        } catch (err) {
          console.error("Error extracting job:", err);
        }
      }
    } else if (urls && Array.isArray(urls)) {
      // URL crawling
      for (const url of urls) {
        try {
          const crawlResults = await crawlUrl(url, { maxPages: 20 });
          for (const result of crawlResults) {
            const jobPostings = extractJobPostings(result.html, result.url);
            for (const posting of jobPostings) {
              try {
                const extracted = await extractJobData(posting.html || posting.text);
                const job = await Job.create({
                  ...extracted,
                  title: (extracted.title as string) || posting.title,
                  jobUrl: posting.url,
                  sourceUrl: url,
                  originalHtml: posting.html,
                  extractedText: posting.text,
                  crawlSessionId,
                  status: "processing",
                });
                allJobs.push(job.toObject());
              } catch (err) {
                console.error("Error extracting job:", err);
              }
            }
          }
        } catch (err) {
          console.error("Error crawling URL:", url, err);
        }
      }
    }

    // Analyze jobs in background
    analyzeJobsBatch(allJobs.map((j) => j._id as string), crawlSessionId);

    return NextResponse.json({
      success: true,
      crawlSessionId,
      jobsFound: allJobs.length,
      jobs: allJobs,
    });
  } catch (error) {
    console.error("Crawl error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to crawl and extract jobs" },
      { status: 500 }
    );
  }
}

async function analyzeJobsBatch(jobIds: string[], crawlSessionId: string) {
  try {
    await dbConnect();
    const jobs = await Job.find({ _id: { $in: jobIds } });

    for (const job of jobs) {
      try {
        const analysis = await analyzeJob({
          title: job.title,
          company: job.company,
          location: job.location,
          requiredSkills: job.requiredSkills,
          preferredSkills: job.preferredSkills,
          responsibilities: job.responsibilities,
          qualifications: job.qualifications,
          experienceRequirements: job.experienceRequirements,
          salary: job.salary,
        });

        await Job.findByIdAndUpdate(job._id, {
          analysis,
          estimatedSalary: analysis.estimatedSalary
            ? { ...analysis.estimatedSalary as Record<string, unknown>, isEstimate: true }
            : undefined,
          status: "completed",
        });
      } catch {
        await Job.findByIdAndUpdate(job._id, { status: "completed" });
      }
    }

    // Generate analytics
    await generateAnalytics(crawlSessionId);
  } catch (err) {
    console.error("Analysis batch error:", err);
  }
}

async function generateAnalytics(crawlSessionId: string) {
  try {
    const jobs = await Job.find({ crawlSessionId });
    if (jobs.length === 0) return;

    const roleCount: Record<string, number> = {};
    const deptCount: Record<string, number> = {};
    const skillCount: Record<string, number> = {};
    const benefitCount: Record<string, number> = {};
    const seniorityCount: Record<string, number> = {};
    const salaries: number[] = [];
    const salaryByRole: Record<string, number[]> = {};
    let remoteCount = 0;

    for (const job of jobs) {
      // Roles
      roleCount[job.title] = (roleCount[job.title] || 0) + 1;

      // Departments
      if (job.department) {
        deptCount[job.department] = (deptCount[job.department] || 0) + 1;
      }

      // Skills
      for (const skill of [...job.requiredSkills, ...job.preferredSkills]) {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      }

      // Benefits
      for (const benefit of job.benefits) {
        benefitCount[benefit] = (benefitCount[benefit] || 0) + 1;
      }

      // Seniority
      if (job.analysis?.difficulty) {
        seniorityCount[job.analysis.difficulty] =
          (seniorityCount[job.analysis.difficulty] || 0) + 1;
      }

      // Salary
      const salaryVal = job.salary?.max || job.estimatedSalary?.max;
      if (salaryVal) {
        salaries.push(salaryVal);
        if (!salaryByRole[job.title]) salaryByRole[job.title] = [];
        salaryByRole[job.title].push(salaryVal);
      }

      // Remote
      if (job.remoteStatus === "Remote") remoteCount++;
    }

    const totalJobs = jobs.length;
    const toArray = (obj: Record<string, number>) =>
      Object.entries(obj)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    await Analytics.create({
      crawlSessionId,
      sourceUrl: jobs[0].sourceUrl,
      totalJobsFound: totalJobs,
      totalJobsProcessed: totalJobs,
      positionAnalysis: {
        commonRoles: toArray(roleCount).slice(0, 20),
        departmentDistribution: toArray(deptCount),
        seniorityDistribution: toArray(seniorityCount),
      },
      skillAnalysis: {
        topSkills: toArray(skillCount).slice(0, 30),
        skillFrequency: toArray(skillCount)
          .slice(0, 30)
          .map((s) => ({ name: s.name, percentage: Math.round((s.count / totalJobs) * 100) })),
        emergingTechnologies: [],
      },
      salaryAnalysis: {
        average: salaries.length ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length) : 0,
        highest: salaries.length ? Math.max(...salaries) : 0,
        lowest: salaries.length ? Math.min(...salaries) : 0,
        byRole: Object.entries(salaryByRole).map(([role, sals]) => ({
          role,
          average: Math.round(sals.reduce((a, b) => a + b, 0) / sals.length),
        })),
        bySeniority: [],
        currency: "USD",
      },
      benefitsAnalysis: {
        commonBenefits: toArray(benefitCount).slice(0, 15),
        remoteWorkFrequency: Math.round((remoteCount / totalJobs) * 100),
        workLifeBalance: [],
      },
    });
  } catch (err) {
    console.error("Analytics generation error:", err);
  }
}
