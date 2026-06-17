const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export interface ModelInfo {
  name: string;
  displayName: string;
  size: string;
  purpose: string;
}

export const SUPPORTED_MODELS: ModelInfo[] = [
  { name: "llama3:8b", displayName: "Llama 3 8B", size: "4.7 GB", purpose: "Job Extraction" },
  { name: "gemma2:9b", displayName: "Gemma 2 9B", size: "5.4 GB", purpose: "Skill Analysis" },
  { name: "qwen3:14b", displayName: "Qwen 3 14B", size: "9.0 GB", purpose: "Learning & Interview" },
];

export async function generateCompletion(
  model: string,
  prompt: string,
  system?: string
): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      system: system || "You are a helpful career intelligence assistant. Always respond with valid JSON when asked for structured data.",
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 4096,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response;
}

export async function listModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.models?.map((m: { name: string }) => m.name) || [];
  } catch {
    return [];
  }
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}

function parseJSON(text: string): Record<string, unknown> {
  // Try direct parse
  try {
    return JSON.parse(text);
  } catch {
    // Try extracting JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    // Try finding JSON object
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) {
      return JSON.parse(objMatch[0]);
    }
    throw new Error("Could not parse JSON from response");
  }
}

export async function extractJobData(html: string, model: string = "llama3:8b") {
  const prompt = `Analyze this job posting HTML/text and extract structured job data. Return a JSON object with these fields:
{
  "title": "job title",
  "company": "company name",
  "department": "department if mentioned",
  "team": "team if mentioned",
  "location": "location",
  "country": "country",
  "remoteStatus": "Remote|Hybrid|On-site|Unknown",
  "employmentType": "Full-time|Part-time|Contract|Internship|Freelance",
  "salary": { "min": number, "max": number, "currency": "USD", "period": "yearly" },
  "benefits": ["benefit1", "benefit2"],
  "workSchedule": "schedule info",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "responsibilities": ["resp1", "resp2"],
  "qualifications": ["qual1", "qual2"],
  "educationRequirements": "education info",
  "experienceRequirements": "experience info",
  "applicationDeadline": "date if mentioned",
  "postingDate": "date if mentioned"
}

Job posting content:
${html.substring(0, 8000)}`;

  const response = await generateCompletion(model, prompt);
  return parseJSON(response);
}

export async function analyzeJob(jobData: Record<string, unknown>, model: string = "gemma2:9b") {
  const prompt = `Analyze this job posting data and provide a comprehensive analysis. Return a JSON object:
{
  "executiveSummary": "2-3 sentence summary of the role, who should apply, and main expectations",
  "difficulty": "Junior|Mid-level|Senior|Staff|Lead",
  "skillImportance": {
    "critical": ["must-have skills"],
    "important": ["strongly preferred skills"],
    "niceToHave": ["bonus skills"]
  },
  "competitiveness": "Easy|Moderate|Competitive|Highly Competitive",
  "careerGrowth": {
    "level": "Low|Medium|High",
    "reasoning": "explanation of growth potential"
  },
  "estimatedSalary": {
    "min": number,
    "max": number,
    "currency": "USD",
    "confidence": "Low|Medium|High"
  }
}

Job data: ${JSON.stringify(jobData)}`;

  const response = await generateCompletion(model, prompt);
  return parseJSON(response);
}

export async function generateLearningRoadmap(
  skill: string,
  context?: string,
  model: string = "qwen3:14b"
) {
  const prompt = `Create a comprehensive learning roadmap for the skill: "${skill}".
${context ? `Context: This is for a job that requires: ${context}` : ""}

Return a JSON object with:
{
  "overview": {
    "whatItIs": "clear explanation",
    "whyCompaniesNeedIt": "business value",
    "realWorldUsage": "practical applications"
  },
  "roadmap": {
    "beginner": { "concepts": ["concept1", "concept2"], "duration": "2-4 weeks" },
    "intermediate": { "projects": ["project1", "project2"], "duration": "4-8 weeks" },
    "advanced": { "topics": ["topic1", "topic2"], "duration": "4-8 weeks" },
    "expert": { "interviewMastery": ["area1", "area2"], "duration": "2-4 weeks" }
  },
  "resources": {
    "documentation": ["url1"],
    "books": ["book1"],
    "tutorials": ["tutorial1"],
    "openSourceProjects": ["project1"],
    "githubRepos": ["repo1"],
    "practiceWebsites": ["site1"]
  },
  "projects": [
    {
      "level": "Beginner|Intermediate|Advanced|Portfolio",
      "title": "project name",
      "goal": "what to build",
      "features": ["feature1"],
      "deliverables": ["deliverable1"],
      "skillsLearned": ["skill1"]
    }
  ],
  "interviewQuestions": [
    {
      "level": "Beginner|Intermediate|Advanced|Expert",
      "question": "the question",
      "answer": "model answer",
      "explanation": "why this answer works",
      "commonMistakes": ["mistake1"]
    }
  ],
  "practicalChallenges": [
    {
      "type": "coding|design|problem-solving",
      "title": "challenge name",
      "description": "what to do",
      "difficulty": "easy|medium|hard"
    }
  ]
}`;

  const response = await generateCompletion(model, prompt);
  return parseJSON(response);
}

export async function generateInterviewPlan(
  jobData: Record<string, unknown>,
  userProfile?: Record<string, unknown>,
  model: string = "qwen3:14b"
) {
  const prompt = `Create a comprehensive interview preparation plan for this job. 
${userProfile ? `Candidate profile: ${JSON.stringify(userProfile)}` : ""}

Return a JSON object with:
{
  "plan30Day": [
    { "week": 1, "focus": "area", "tasks": ["task1"], "milestones": ["milestone1"] }
  ],
  "plan60Day": [
    { "week": 1, "focus": "area", "tasks": ["task1"], "milestones": ["milestone1"] }
  ],
  "plan90Day": [
    { "week": 1, "focus": "area", "tasks": ["task1"], "milestones": ["milestone1"] }
  ],
  "requiredProjects": [
    { "title": "project", "description": "desc", "skills": ["skill1"], "estimatedTime": "2 weeks" }
  ],
  "certifications": [
    { "name": "cert", "provider": "AWS", "relevance": "why", "estimatedTime": "1 month", "url": "" }
  ],
  "resumeOptimization": {
    "missingSkills": ["skill1"],
    "suggestions": ["suggestion1"],
    "keywordImprovements": ["keyword1"]
  },
  "riskAnalysis": {
    "weakAreas": ["area1"],
    "missingExperience": ["exp1"],
    "missingSkills": ["skill1"],
    "improvements": ["improvement1"]
  },
  "skillGap": {
    "missingSkills": ["skill1"],
    "missingProjects": ["project1"],
    "missingExperience": ["exp1"],
    "readinessScore": 65
  },
  "mockInterviews": [
    {
      "type": "technical|behavioral|scenario",
      "questions": [
        { "question": "q1", "expectedAnswer": "a1", "tips": ["tip1"] }
      ]
    }
  ]
}

Job data: ${JSON.stringify(jobData)}`;

  const response = await generateCompletion(model, prompt);
  return parseJSON(response);
}
