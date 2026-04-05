import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import dotenv from "dotenv";
import { resume, jobDescription, selfDescription } from "./temp.js";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z.number().min(0).max(100),
  technicalQuestions: z
    .array(
      z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string(),
      }),
    )
    .min(5)
    .max(5),
  behavioralQuestions: z
    .array(
      z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string(),
      }),
    )
    .min(5)
    .max(5),
  skillGaps: z
    .array(
      z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"]),
      }),
    )
    .min(3)
    .max(6),
  preparationPlan: z
    .array(
      z.object({
        day: z.number().int().min(1).max(7),
        focus: z.string(),
        tasks: z.array(z.string()).min(2).max(4),
      }),
    )
    .min(7)
    .max(7),
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
    matchScore: {
      type: Type.NUMBER,
      description: "Score from 0 to 100",
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

async function generateInterviewReport({
  jobDescription,
  candidateResume,
  selfDescription,
}) {
  const prompt = `
Generate a realistic interview report in strict JSON.

Do not return placeholders like "question", "intention", "answer", "skill", "severity", "day", "focus", "tasks".
Return concrete values based on the candidate and role.

Use exactly:
- 5 technical questions
- 5 behavioral questions
- 3-6 skill gaps
- 7-day preparation plan (day: 1 to 7)
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
${prompt}

Job Description:
${jobDescription}

Candidate Resume:
${candidateResume}

Self Description:
${selfDescription}
`,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: interviewReportResponseSchema,
    },
  });

  const rawText = response.text;
  const parsed = JSON.parse(rawText);

  const validated = interviewReportSchema.safeParse(parsed);
  if (!validated.success) {
    console.error("Schema validation failed. Raw model output:\n", rawText);
    console.error("Validation issues:\n", validated.error.issues);
    throw new Error(
      "Model JSON did not match required interview report schema",
    );
  }

  return validated.data;
}

generateInterviewReport({
  jobDescription,
  candidateResume: resume,
  selfDescription,
})
  .then((data) => {
    console.log("Interview report generated successfully:\n");
    console.dir(data, { depth: null });
  })
  .catch((err) => {
    console.error("Failed to generate interview report:", err.message);
  });
