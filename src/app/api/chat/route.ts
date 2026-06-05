import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";

export const dynamic = "force-dynamic";

function getMockFallbackResponse(messages: any[]) {
  const encoder = new TextEncoder();
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
  
  let msgs = [
    "This is a simulated response indicating that your system is functioning, but no OpenAI API Key was provided."
  ];

  if (lastMsg.includes("policy") || lastMsg.includes("refund")) {
    msgs = ["I have found the insurance policy you requested. Here is the coverage card:\n\n[REFUND_POLICY_CARD]"];
  } else if (lastMsg.includes("record") || lastMsg.includes("test@newco")) {
    msgs = ["I located your Electronic Health Record (EHR). Here is your patient profile:\n\n[USER_RECORD_CARD]"];
  } else if (lastMsg.includes("dispute") || lastMsg.includes("charge")) {
    msgs = ["I see there is a billing dispute regarding your recent $150 MRI copay. I have flagged this transaction and escalated the ticket to human billing specialists."];
  }

  const stream = new ReadableStream({
    async start(controller) {
      for (const msg of msgs) {
        controller.enqueue(encoder.encode(`0:${JSON.stringify(msg)}\n`));
        await new Promise(r => setTimeout(r, 600));
      }
      controller.close();
    }
  });
  return new Response(stream, { 
    headers: { 
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    } 
  });
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    // 1. Authenticate user
    const sessionId = req.cookies.get("supportiq_session")?.value;
    if (!sessionId) return new Response("Unauthorized", { status: 401 });

    // 2. Persist the latest user message to the database
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.role === "user") {
      await prisma.message.create({
        data: {
          userId: sessionId,
          role: "user",
          content: latestMessage.content,
        }
      });
    }

    try {
      // 3. Initialize OpenAI Stream with Native Tool Calling
      const result = await streamText({
        model: openai("gpt-4o-mini"),
        system: `You are SupportIQ, an autonomous AI customer support agent for MeridianHealth (NewCo). 
        You are highly professional, concise, and helpful. 
        You MUST use your provided tools to look up policies, check status, or escalate issues. 
        Do not guess policies. Use the check_policy tool.
        If a user asks about billing disputes over $100, use the escalate_to_human tool immediately.`,
        messages,
        tools: {
          check_policy: tool({
            description: "Check the knowledge base for company policies regarding appointments, insurance, prescriptions, refunds, or hours.",
            parameters: z.object({
              topic: z.enum(["appointments", "insurance", "prescriptions", "refunds", "hours", "general"]),
            }),
            execute: async ({ topic }) => {
              const kb: Record<string, string> = {
                appointments: "Cancellations are free with 24+ hours notice. Within 24 hours: $25 fee.",
                insurance: "We accept Aetna, Blue Cross, Cigna. Copays: Therapy $25, Primary $20.",
                prescriptions: "Refills processed within 48 hours. Controlled meds require a visit.",
                refunds: "Refunds available within 7 days of service.",
                hours: "M-F 8am-8pm ET, Sat 9am-5pm ET.",
                general: "General policy information."
              };
              return kb[topic] || "No specific policy found.";
            }
          }),
          escalate_to_human: tool({
            description: "Escalate the conversation to a human support agent.",
            parameters: z.object({
              reason: z.string().describe("The reason for escalation"),
              priority: z.enum(["high", "medium", "low"])
            }),
            execute: async ({ reason, priority }) => {
              return `Ticket created successfully. Priority: ${priority}. Reason: ${reason}. A human agent will take over shortly.`;
            }
          }),
          lookup_patient_record: tool({
            description: "Look up a patient's record by email.",
            parameters: z.object({ email: z.string() }),
            execute: async ({ email }) => {
              const user = await prisma.user.findUnique({ where: { email } });
              if (!user) return "Patient not found in database.";
              return `Found patient: ${user.email}. Onboarding Step: ${user.step}.`;
            }
          })
        },
        onFinish: async (event) => {
          // 4. Persist the AI's final response and tool executions to the database
          const toolCallsLog = event.toolCalls && event.toolCalls.length > 0 
            ? `[Tool Calls: ${event.toolCalls.map(t => t.toolName).join(', ')}] ` 
            : '';
            
          await prisma.message.create({
            data: {
              userId: sessionId,
              role: "agent",
              content: toolCallsLog + event.text,
            }
          });
        }
      });

      // 5. Stream response directly to client
      return result.toDataStreamResponse();
    } catch (llmError) {
      console.warn("LLM API failed. Falling back to mock stream:", llmError);
      return getMockFallbackResponse(messages);
    }
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
