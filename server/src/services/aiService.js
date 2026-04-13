import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import dotenv from "dotenv";
import PDFDocument from "pdfkit";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not configured");
}

const openai = new OpenAI({ apiKey });

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

function parseHtmlToPdfElements(html) {
  const elements = [];

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
  try {
    console.log("Starting interview report generation with OpenAI...");

    const response = await openai.responses.parse({
      model: "gpt-4o-2024-08-06",
      input: [
        {
          role: "system",
          content:
            "You are an expert interview coach. Create a tailored interview report based on the provided information.",
        },
        {
          role: "user",
          content: `
Create a tailored interview report from:
- Job Description: ${jobDescription}
- Candidate Resume: ${candidateResume}
- Candidate Self Description: ${selfDescription}

Rules:
1) matchScore: number from 0 to 100
2) technicalQuestions: exactly 5 items
3) behavioralQuestions: exactly 5 items
4) skillGaps: 3 to 6 items with severity in ["low","medium","high"]
5) preparationPlan: exactly 7 items with day 1..7 and 2-4 tasks each
6) Use concrete, role-specific content
7) Include a short "title" for this report (optional)
`,
        },
      ],
      text: {
        format: zodTextFormat(interviewReportSchema, "interview_report"),
      },
    });

    console.log("Interview report generated successfully");
    return response.output_parsed;
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

    const response = await openai.responses.parse({
      model: "gpt-4o-2024-08-06",
      input: [
        {
          role: "system",
          content:
            "You are a senior resume writer and ATS optimization expert. Generate a polished, modern, ATS-friendly one-page resume in valid HTML.",
        },
        {
          role: "user",
          content: `
Generate a polished, modern, ATS-friendly one-page resume in valid HTML.

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
`,
        },
      ],
      text: {
        format: zodTextFormat(resumeHtmlSchema, "resume_html"),
      },
    });

    console.log("Received resume HTML from OpenAI");
    const htmlContent = response.output_parsed.html;

    console.log("Converting HTML to PDF...");
    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    console.log("Resume PDF generation completed successfully");
    return pdfBuffer;
  } catch (err) {
    console.error("Resume PDF generation failed:", err.message);
    throw err;
  }
}
