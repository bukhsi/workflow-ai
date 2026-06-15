import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      recipient: z.string().min(1).max(200),
      purpose: z.string().min(1).max(2000),
      tone: z.enum(["Professional", "Friendly", "Formal", "Persuasive"]),
      context: z.string().max(4000).optional().default(""),
    }),
  )
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const prompt = `You are a professional business communication assistant.
Generate a clear and concise email.

Recipient: ${data.recipient}
Purpose: ${data.purpose}
Tone: ${data.tone}
Context: ${data.context || "(none provided)"}

Requirements:
- Professional language
- Proper greeting and closing
- Clear call-to-action

Return ONLY the email body text including subject line on the first line as "Subject: ...". Do not wrap in code fences or commentary.`;
    const { text } = await generateText({ model: gateway(MODEL), prompt });
    return { text };
  });

const MeetingSchema = z.object({
  executiveSummary: z.string(),
  keyDecisions: z.array(z.string()),
  actionItems: z.array(
    z.object({
      task: z.string(),
      owner: z.string(),
      dueDate: z.string(),
    }),
  ),
  risks: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      transcript: z.string().min(20).max(50000),
      meetingType: z.string().max(100).optional().default("General"),
    }),
  )
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const prompt = `Analyze the meeting transcript (${data.meetingType}) and produce a structured summary.

Transcript:
${data.transcript}

Return: executiveSummary, keyDecisions[], actionItems[{task, owner, dueDate}], risks[], nextSteps[].
If owner or dueDate are unknown, use "Unassigned" or "TBD".`;
    const { experimental_output } = await generateText({
      model: gateway(MODEL),
      prompt,
      experimental_output: Output.object({ schema: MeetingSchema }),
    });
    return experimental_output;
  });

const PlanSchema = z.object({
  milestones: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      tasks: z.array(
        z.object({
          title: z.string(),
          effort: z.string(),
          dependencies: z.array(z.string()),
        }),
      ),
    }),
  ),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      goal: z.string().min(3).max(2000),
      timeline: z.string().min(1).max(200),
      priority: z.enum(["Low", "Medium", "High", "Critical"]),
    }),
  )
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const prompt = `Act as an experienced project manager.

Create a task breakdown for:
Goal: ${data.goal}
Timeline: ${data.timeline}
Priority: ${data.priority}

Provide 2-4 milestones, each with 3-6 tasks. For each task include effort estimate (e.g. "2 days") and an array of dependencies (other task titles, or empty array).`;
    const { experimental_output } = await generateText({
      model: gateway(MODEL),
      prompt,
      experimental_output: Output.object({ schema: PlanSchema }),
    });
    return experimental_output;
  });

const ResearchSchema = z.object({
  overview: z.string(),
  keyFindings: z.array(z.string()),
  industryTrends: z.array(z.string()),
  opportunities: z.array(z.string()),
  risks: z.array(z.string()),
  references: z.array(z.string()),
});

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      topic: z.string().min(3).max(500),
      depth: z.enum(["Quick Overview", "Detailed Analysis", "Expert Report"]),
    }),
  )
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const prompt = `Research the following topic and produce a structured business report.

Topic: ${data.topic}
Depth: ${data.depth}

Provide: overview, keyFindings[], industryTrends[], opportunities[], risks[], references[] (notable sources or organizations, even if general). Be concrete and concise.`;
    const { experimental_output } = await generateText({
      model: gateway(MODEL),
      prompt,
      experimental_output: Output.object({ schema: ResearchSchema }),
    });
    return experimental_output;
  });