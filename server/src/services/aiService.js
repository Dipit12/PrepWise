import Groq from "groq-sdk";
import { z } from "zod";
import dotenv from "dotenv";
import PDFDocument from "pdfkit";

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  throw new Error("GROQ_API_KEY is not configured");
}

const groq = new Groq({ apiKey });

const GROQ_MODEL = "openai/gpt-oss-20b";

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

const resumeHtmlSchema = z.object({
  html: z.string().min(1),
});

const interviewReportResponseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    matchScore: {
      type: "number",
    },
    technicalQuestions: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: { type: "string" },
          intention: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "intention", "answer"],
      },
    },
    behavioralQuestions: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: { type: "string" },
          intention: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "intention", "answer"],
      },
    },
    skillGaps: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          skill: { type: "string" },
          severity: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
        },
        required: ["skill", "severity"],
      },
    },
    preparationPlan: {
      type: "array",
      minItems: 7,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          day: { type: "integer" },
          focus: { type: "string" },
          tasks: {
            type: "array",
            minItems: 2,
            maxItems: 4,
            items: { type: "string" },
          },
        },
        required: ["day", "focus", "tasks"],
      },
    },
    title: {
      type: "string",
    },
  },
  required: [
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
    "title",
  ],
};

const resumeHtmlResponseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    html: {
      type: "string",
    },
  },
  required: ["html"],
};

function buildGroqResponseFormat(name, jsonSchema) {
  return {
    type: "json_schema",
    json_schema: {
      name,
      strict: true,
      schema: jsonSchema,
    },
  };
}

async function generateStructuredOutput({
  schemaName,
  schema,
  responseSchema,
  systemPrompt,
  userPrompt,
}) {
  let response;

  try {
    response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: buildGroqResponseFormat(schemaName, responseSchema),
    });
  } catch (err) {
    const code = err?.error?.code || err?.code;
    if (code === "json_validate_failed") {
      response = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: `${systemPrompt}

Return only a JSON object that matches the schema exactly.
Do not include markdown fences, explanations, comments, or any text outside the JSON object.`,
          },
          { role: "user", content: userPrompt },
        ],
        response_format: buildGroqResponseFormat(schemaName, responseSchema),
      });
    } else {
      throw err;
    }
  }

  const content = response.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned an empty response");
  }

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Groq returned invalid JSON");
  }

  if (parsed.title === "") {
    parsed.title = undefined;
  }

  return schema.parse(parsed);
}

function cleanupHtmlResponse(html) {
  if (!html) return "";

  let cleaned = html.trim();

  cleaned = cleaned.replace(/^```html\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");

  return cleaned.trim();
}

async function generateRawHtml({ systemPrompt, userPrompt }) {
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const html = response.choices?.[0]?.message?.content;

  if (!html) {
    throw new Error("Groq returned an empty HTML response");
  }

  const cleanedHtml = cleanupHtmlResponse(html);

  if (!cleanedHtml) {
    throw new Error("Groq returned empty HTML after cleanup");
  }

  return cleanedHtml;
}

function parseHtmlToPdfElements(html) {
  const elements = [];

  // Remove style tags and their content
  let cleanHtml = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // Parse elements
  const tagRegex =
    /<([a-z][a-z0-9]*)\b[^>]*>([^<]*)<\/\1>|<([a-z][a-z0-9]*)\b[^>]*>([^<]*)/gi;
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
              doc
                .fontSize(18)
                .font("Helvetica-Bold")
                .text(text, { align: "center" });
              doc.moveDown(0.3);
              doc.font("Helvetica");
              break;

            case "h2":
              doc.fontSize(14).font("Helvetica-Bold").text(text);
              doc
                .moveTo(doc.page.margins.left, doc.y)
                .lineTo(doc.page.width - doc.page.margins.right, doc.y)
                .stroke();
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
  try {
    console.log("Starting interview report generation with Groq...");

    const report = await generateStructuredOutput({
      schemaName: "interview_report",
      schema: interviewReportSchema,
      responseSchema: interviewReportResponseSchema,
      systemPrompt:
        "You are an expert interview coach. Create a tailored interview report based on the provided information. Return only a JSON object matching the provided schema exactly.",
      userPrompt: `
Create a tailored interview report from:
- Job Description: ${jobDescription}
- Candidate Resume: ${candidateResume}
- Candidate Self Description: ${selfDescription}

Rules:
1) matchScore must be a number from 0 to 100
2) technicalQuestions must contain exactly 5 items
3) behavioralQuestions must contain exactly 5 items
4) skillGaps must contain 3 to 6 items with severity in ["low","medium","high"]
5) preparationPlan must contain exactly 7 items with day values 1 through 7 and 2-4 tasks each
6) Use concrete, role-specific content
7) title must always be present as a short report title
8) Return valid JSON only
`,
    });

    console.log("Interview report generated successfully");
    return report;
  } catch (err) {
    console.error("Interview report generation error:", err.message);
    throw err;
  }
}

export async function generateResumePDF({
  resume,
  selfDescription,
  jobDescription,
}) {
  try {
    console.log("Starting resume PDF generation...");

    const htmlContent = await generateRawHtml({
      systemPrompt:
        "You are a senior resume writer and ATS optimization expert. Return only valid semantic HTML for a polished, modern, ATS-friendly one-page resume. Do not return JSON. Do not include markdown fences. Do not include explanations.",
      userPrompt: `
Generate a polished, modern, ATS-friendly one-page resume in valid HTML.

Requirements:
- Must be valid semantic HTML
- Use h1 for name, h2 for sections, h3 for subsections
- Use <p> tags for paragraphs
- Use <ul><li> for bullet points
- Use <strong> for important text
- No CSS required
- Keep concise and impactful bullet points
- Must fit on one page
- Return raw HTML only

Candidate Resume Source:
${resume}

Candidate Self Description:
${selfDescription}

Target Job Description:
${jobDescription}
`,
    });

    console.log("Received resume HTML from Groq");

    console.log("Converting HTML to PDF...");
    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    console.log("Resume PDF generation completed successfully");
    return pdfBuffer;
  } catch (err) {
    console.error("Resume PDF generation failed:", err.message);
    throw err;
  }
}
