import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import dotenv from "dotenv";
import PDFDocument from "pdfkit";

dotenv.config();

const apiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_GENAI_API_KEY is not configured");
}

const ai = new GoogleGenAI({ apiKey });

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

function parseHtmlToPdfElements(html) {
  const elements = [];
  let currentPos = 0;

  // Remove style tags and their content
  let cleanHtml = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // Parse elements
  const tagRegex = /<([a-z][a-z0-9]*)\b[^>]*>([^<]*)<\/\1>|<([a-z][a-z0-9]*)\b[^>]*>([^<]*)/gi;
  let match;

  while ((match = tagRegex.exec(cleanHtml)) !== null) {
    const tagName = (match[1] || match[3]).toLowerCase();
    const content = (match[2] || match[4]).trim();

    if (!content) continue;

    // Decode HTML entities
    const text = content
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    elements.push({ tag: tagName, text });
  }

  return elements;
}

async function generatePdfFromHtml(htmlContent) {
  try {
    console.log("Starting PDF generation with pdfkit...");

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        bufferPages: true,
        margin: 40,
        size: "A4",
      });

      const chunks = [];

      doc.on("data", (chunk) => {
        chunks.push(chunk);
      });

      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        console.log("PDF generated successfully, size:", pdfBuffer.length);
        resolve(pdfBuffer);
      });

      doc.on("error", (err) => {
        console.error("PDF generation error:", err);
        reject(err);
      });

      try {
        // Parse HTML
        const elements = parseHtmlToPdfElements(htmlContent);

        doc.font("Helvetica");

        for (const element of elements) {
          // Check page height and add new page if needed
          if (doc.y > doc.page.height - 60) {
            doc.addPage();
          }

          const { tag, text } = element;

          switch (tag.toLowerCase()) {
            case "h1":
              doc.fontSize(18).font("Helvetica-Bold").text(text, { align: "center" });
              doc.moveDown(0.3);
              doc.font("Helvetica");
              break;

            case "h2":
              doc.fontSize(14).font("Helvetica-Bold").text(text);
              doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
              doc.moveDown(0.3);
              doc.font("Helvetica");
              break;

            case "h3":
              doc.fontSize(11).font("Helvetica-Bold").text(text);
              doc.moveDown(0.2);
              doc.font("Helvetica");
              break;

            case "p":
              doc.fontSize(10).text(text, { align: "justify" });
              doc.moveDown(0.2);
              break;

            case "li":
              doc.fontSize(10).text("• " + text, { align: "left" });
              doc.moveDown(0.15);
              break;

            case "strong":
            case "b":
              doc.fontSize(10).font("Helvetica-Bold").text(text);
              doc.font("Helvetica");
              break;

            case "em":
            case "i":
              doc.fontSize(10).font("Helvetica-Oblique").text(text);
              doc.font("Helvetica");
              break;

            default:
              doc.fontSize(10).text(text);
              doc.moveDown(0.1);
          }
        }

        doc.end();
      } catch (err) {
        doc.end();
        reject(err);
      }
    });
  } catch (err) {
    console.error("PDF generation error:", err.message);
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
- Valid semantic HTML with proper structure
- Use h1 for name, h2 for sections, h3 for subsections
- Use <p> tags for paragraphs
- Use <ul><li> for bullet points
- Use <strong> for important text
- Professional content, no CSS styling needed
- Keep concise and impactful bullet points
- Must be one page only

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

    console.log("Converting HTML to PDF...");
    const pdfBuffer = await generatePdfFromHtml(validated.data.html);

    console.log("Resume PDF generation completed successfully");
    return pdfBuffer;
  } catch (err) {
    console.error("Resume PDF generation failed:", err.message);
    throw err;
  }
}
