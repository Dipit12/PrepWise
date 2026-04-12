import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import dotenv from "dotenv";
import puppeteer from "puppeteer";
import { execSync } from "child_process";

dotenv.config();

const apiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_GENAI_API_KEY is not configured");
}

const ai = new GoogleGenAI({ apiKey });

// Helper to find Chrome executable
function getChromeExecutable() {
  try {
    // Try to find Chrome in cache directory (Render)
    const cacheDir = "/opt/render/.cache/puppeteer";
    const result = execSync(`find ${cacheDir} -name "chrome" -o -name "chromium" 2>/dev/null || true`, { encoding: 'utf8' }).trim();
    if (result) return result.split('\n')[0];
  } catch (e) {
    // Ignore errors
  }

  // Fallback to common Chrome locations
  const commonPaths = [
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
  ];

  for (const path of commonPaths) {
    try {
      execSync(`test -f ${path}`, { stdio: 'ignore' });
      return path;
    } catch (e) {
      // Continue to next path
    }
  }

  return null;
}

const interviewReportSchema = z.object({
  matchScore: z.number().min(0).max(100),
  technicalQuestions: z
    .array(
      z.object({
        question: z.string().min(1),
        intention: z.string().min(1),
        answer: z.string().min(1),
      }),
    )
    .min(5)
    .max(5),
  behavioralQuestions: z
    .array(
      z.object({
        question: z.string().min(1),
        intention: z.string().min(1),
        answer: z.string().min(1),
      }),
    )
    .min(5)
    .max(5),
  skillGaps: z
    .array(
      z.object({
        skill: z.string().min(1),
        severity: z.enum(["low", "medium", "high"]),
      }),
    )
    .min(3)
    .max(6),
  preparationPlan: z
    .array(
      z.object({
        day: z.number().int().min(1).max(7),
        focus: z.string().min(1),
        tasks: z.array(z.string().min(1)).min(2).max(4),
      }),
    )
    .min(7)
    .max(7),
  title: z.string().min(1).optional(),
});

const interviewReportResponseSchema = {
  type: Type.OBJECT,
  required: [
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
  ],
  properties: {
    matchScore: { type: Type.NUMBER, description: "Score from 0 to 100" },
    title: {
      type: Type.STRING,
      description: "Short report title for this interview prep",
    },
    technicalQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["question", "intention", "answer"],
        properties: {
          question: { type: Type.STRING },
          intention: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
      },
    },
    behavioralQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["question", "intention", "answer"],
        properties: {
          question: { type: Type.STRING },
          intention: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
      },
    },
    skillGaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["skill", "severity"],
        properties: {
          skill: { type: Type.STRING },
          severity: {
            type: Type.STRING,
            enum: ["low", "medium", "high"],
          },
        },
      },
    },
    preparationPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["day", "focus", "tasks"],
        properties: {
          day: { type: Type.NUMBER },
          focus: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      },
    },
  },
};

const resumeHtmlSchema = z.object({
  html: z.string().min(1),
});

const resumeHtmlResponseSchema = {
  type: Type.OBJECT,
  required: ["html"],
  properties: {
    html: {
      type: Type.STRING,
      description:
        "Complete HTML document for a polished one-page ATS-friendly resume",
    },
  },
};

async function readModelText(response) {
  if (!response) throw new Error("Empty response from model");

  if (typeof response.text === "string") return response.text;
  if (typeof response.text === "function") {
    const maybeText = await response.text();
    if (typeof maybeText === "string") return maybeText;
  }

  throw new Error("Model response does not contain readable text");
}

function stripCodeFences(text) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function parseJsonFromModelText(rawText) {
  const cleaned = stripCodeFences(rawText);

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback: extract first JSON object block
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("Model did not return valid JSON");
  }
}

function ensureFullHtmlDocument(html) {
  const trimmed = (html || "").trim();
  if (/<!doctype html>/i.test(trimmed) || /<html[\s>]/i.test(trimmed)) {
    return trimmed;
  }

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Generated Resume</title>
  <style>
    @page { size: A4; margin: 18mm 14mm; }
    body {
      font-family: Inter, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.45;
      font-size: 12px;
      margin: 0;
    }
    h1,h2,h3 { margin: 0 0 8px; }
    h1 { font-size: 24px; }
    h2 { font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 14px; }
    p { margin: 0 0 8px; }
    ul { margin: 0 0 8px 18px; }
    li { margin-bottom: 4px; }
  </style>
</head>
<body>
${trimmed}
</body>
</html>`;
}

async function generatePdfFromHtml(htmlContent) {
  try {
    console.log("Starting Puppeteer browser launch...");
    const chromeExecutable = getChromeExecutable();
    console.log("Chrome executable found at:", chromeExecutable);

    const launchOptions = {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };

    if (chromeExecutable) {
      launchOptions.executablePath = chromeExecutable;
    }

    const browser = await puppeteer.launch(launchOptions);

    try {
      console.log("Browser launched, creating new page...");
      const page = await browser.newPage();
      
      console.log("Setting page content...");
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      console.log("Generating PDF...");
      const pdfData = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
      });

      console.log("PDF generated successfully, size:", pdfData?.length || 0);
      return Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData);
    } finally {
      console.log("Closing browser...");
      await browser.close();
    }
  } catch (err) {
    console.error("PDF generation error:", err.message);
    console.error("Error stack:", err.stack);
    throw err;
  }
}

export async function generateInterviewReport({
  jobDescription,
  candidateResume,
  selfDescription,
}) {
  const prompt = `
You are an expert interview coach.
Return ONLY strict JSON (no markdown, no explanation).

Create a tailored interview report from:
- Job Description
- Candidate Resume
- Candidate Self Description

Rules:
1) matchScore: number from 0 to 100
2) technicalQuestions: exactly 5 items
3) behavioralQuestions: exactly 5 items
4) skillGaps: 3 to 6 items with severity in ["low","medium","high"]
5) preparationPlan: exactly 7 items with day 1..7 and 2-4 tasks each
6) Use concrete, role-specific content (no placeholders)
7) Include a short "title" for this report (optional)

Job Description:
${jobDescription}

Candidate Resume:
${candidateResume}

Self Description:
${selfDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: interviewReportResponseSchema,
    },
  });

  const rawText = await readModelText(response);
  const parsed = parseJsonFromModelText(rawText);

  const validated = interviewReportSchema.safeParse(parsed);
  if (!validated.success) {
    console.error(
      "Interview schema validation failed:",
      validated.error.issues,
    );
    console.error("Raw model output:", rawText);
    throw new Error("Model JSON did not match interview report schema");
  }

  return validated.data;
}

export async function generateResumePDF({
  resume,
  selfDescription,
  jobDescription,
}) {
  try {
    console.log("Starting resume PDF generation...");
    
    const prompt = `
You are a senior resume writer and ATS optimization expert.

Generate a polished, modern, ATS-friendly one-page resume in valid HTML.
Return ONLY JSON with exactly one key: "html".

Requirements:
- Valid semantic HTML
- Professional typography and spacing
- Include sections: Summary, Skills, Experience, Projects, Education
- Tailor wording to the provided Job Description
- Keep concise and impactful bullet points
- Keep styling inline or in <style> block only (self-contained)
- Must be printable to A4 PDF with clean layout

Candidate Resume Source:
${resume}

Candidate Self Description:
${selfDescription}

Target Job Description:
${jobDescription}
`;

    console.log("Calling Google Generative AI for resume HTML generation...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.25,
        responseMimeType: "application/json",
        responseSchema: resumeHtmlResponseSchema,
      },
    });

    console.log("Received response from Google Generative AI");
    const rawText = await readModelText(response);
    const parsed = parseJsonFromModelText(rawText);

    console.log("Validating resume HTML schema...");
    const validated = resumeHtmlSchema.safeParse(parsed);
    if (!validated.success) {
      console.error(
        "Resume HTML schema validation failed:",
        validated.error.issues,
      );
      console.error("Raw model output:", rawText);
      throw new Error("Model JSON did not match resume html schema");
    }

    console.log("Ensuring full HTML document...");
    const htmlDocument = ensureFullHtmlDocument(validated.data.html);
    
    console.log("Converting HTML to PDF using Puppeteer...");
    const pdfBuffer = await generatePdfFromHtml(htmlDocument);

    console.log("Resume PDF generation completed successfully");
    return pdfBuffer;
  } catch (err) {
    console.error("Resume PDF generation failed:", err.message);
    throw err;
  }
}
