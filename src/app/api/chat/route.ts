import { NextRequest, NextResponse } from "next/server";

// Smart mock responses that simulate real AI agent behavior
// To use real Claude API: set ANTHROPIC_API_KEY env variable
// KNOWLEDGE_BASE removed


interface ToolCall {
  name: string;
  input: string;
  result: string;
}

function generateMockResponse(message: string): {
  reasoning: string;
  tools: ToolCall[];
  response: string;
  confidence: number;
  escalate: boolean;
} {
  const lower = message.toLowerCase();

  if (lower.includes("cancel") || lower.includes("appointment")) {
    return {
      reasoning: "Customer asking about appointment cancellation policy",
      tools: [
        { name: "check_appointment_policy", input: "cancellation", result: "Free >24hrs, $25 fee <24hrs" },
      ],
      response: "If your appointment is more than 24 hours away, you can cancel at no charge. Within 24 hours, a $25 late cancellation fee applies. You can cancel directly from your patient portal or reply here and I'll handle it for you.",
      confidence: 96,
      escalate: false,
    };
  }

  if (lower.includes("insurance") || lower.includes("cover") || lower.includes("copay")) {
    return {
      reasoning: "Insurance coverage inquiry — checking accepted providers",
      tools: [
        { name: "check_insurance_coverage", input: "all_providers", result: "Aetna, BCBS, Cigna, UHC accepted" },
      ],
      response: "We accept Aetna, Blue Cross Blue Shield, Cigna, and United Healthcare. In-network copays are $25 for therapy and $20 for primary care visits. If you're out-of-network, the self-pay rate is $89 per visit. Want me to check your specific plan?",
      confidence: 94,
      escalate: false,
    };
  }

  if (lower.includes("prescri") || lower.includes("refill") || lower.includes("medication")) {
    return {
      reasoning: "Prescription refill request — checking medication policies",
      tools: [
        { name: "check_prescription_status", input: "refill_request", result: "Standard: 48hrs, controlled: new appt required" },
      ],
      response: "Standard prescription refills are processed within 48 hours. If you need a controlled substance, you'll need to schedule a new appointment with your provider. I can help you request a refill or schedule an appointment — which would you prefer?",
      confidence: 93,
      escalate: false,
    };
  }

  if (lower.includes("refund") || lower.includes("charge") || lower.includes("bill") || lower.includes("dispute")) {
    const amount = lower.match(/\$(\d+)/);
    if (amount && parseInt(amount[1]) > 100) {
      return {
        reasoning: "Billing dispute over $100 — requires human escalation",
        tools: [
          { name: "check_billing_history", input: "dispute", result: "Amount exceeds auto-resolve threshold" },
          { name: "escalate_to_human", input: "billing_dispute", result: "Ticket ESC-48291 created, priority: high" },
        ],
        response: "I understand you'd like to dispute a charge. For billing disputes over $100, I want to make sure you get the best support possible. I've escalated this to our billing team — they'll reach out within 2 business hours. Your ticket number is ESC-48291.",
        confidence: 82,
        escalate: true,
      };
    }
    return {
      reasoning: "Refund inquiry — checking eligibility",
      tools: [
        { name: "check_refund_eligibility", input: "general", result: "Eligible within 7 days of service" },
      ],
      response: "Refunds are available within 7 days of your appointment. Could you provide the date of service and the email on your account? I'll check your eligibility right away.",
      confidence: 91,
      escalate: false,
    };
  }

  if (lower.includes("hours") || lower.includes("open") || lower.includes("available")) {
    return {
      reasoning: "Customer asking about business hours",
      tools: [
        { name: "lookup_business_hours", input: "current", result: "M-F 8am-8pm, Sat 9am-5pm ET" },
      ],
      response: "Our virtual care team is available Monday through Friday, 8am to 8pm ET, and Saturday 9am to 5pm ET. AI support — that's me — is here 24/7. How can I help you today?",
      confidence: 98,
      escalate: false,
    };
  }

  if (lower.includes("hipaa") || lower.includes("privacy") || lower.includes("data") || lower.includes("secure")) {
    return {
      reasoning: "Privacy/compliance inquiry",
      tools: [
        { name: "check_compliance_status", input: "hipaa", result: "Fully HIPAA compliant, SOC 2 certified" },
      ],
      response: "We take privacy seriously. MeridianHealth is fully HIPAA-compliant and SOC 2 certified. Your health data is encrypted at rest and in transit, and is never shared with third parties. Is there anything specific about our privacy practices you'd like to know?",
      confidence: 97,
      escalate: false,
    };
  }

  // Default response
  return {
    reasoning: "General inquiry — providing helpful guidance",
    tools: [
      { name: "search_knowledge_base", input: message.slice(0, 50), result: "No exact match — providing general assistance" },
    ],
    response: "Thanks for reaching out! I can help with appointments, insurance questions, prescriptions, billing, and general account inquiries. Could you tell me more about what you need help with? If your question requires a specialist, I'll connect you with the right team member.",
    confidence: 85,
    escalate: false,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    // Simulate processing delay for realism
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

    const result = generateMockResponse(message);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
