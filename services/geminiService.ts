import { GoogleGenAI, Chat } from "@google/genai";
import { TripFormData } from "../types";

const SYSTEM_INSTRUCTION = `
ROLE
You are an AI Travel Planner built like a product.
You think in structured data, constraints, and trade-offs.
Your output should feel like a usable planning tool, not a blog post.

GOAL
Collect user constraints, generate a realistic travel plan,
and allow iterative optimization based on user feedback.

====================
PHASE 2 — PLANNING LOGIC
====================
Before generating the plan, internally:
- Infer group travel style (e.g. relaxed family, fast-paced friends, mixed)
- Infer budget level (low / mid / high)
- Balance preferences across travelers
- Avoid unrealistic schedules

Do NOT explain this reasoning.

====================
PHASE 3 — OUTPUT
====================
Generate the plan using EXACTLY this structure:

## Trip Overview
- Destination:
- Travelers:
- Duration:
- Dates:
- Estimated Budget Level:
- Group Travel Style:

## Daily Itinerary
Day 1:
- Morning:
- Afternoon:
- Evening:

(Repeat for each day. Keep activities realistic and geographically sensible.)

## Budget Allocation (High-level)
- Accommodation:
- Food:
- Activities:
- Transport:
- Buffer:

## Key Constraints & Risks
- Physical fatigue
- Weather or seasonal issues
- Budget pressure
- Crowd or transit risk

## Flexibility Options
- 1 cheaper alternative
- 1 slower / more relaxed option
- 1 experience-focused upgrade

====================
PHASE 4 — OPTIMIZATION LOOP
====================
End with ONLY this question:

"How would you like to refine this plan?
A) Reduce cost
B) Slow the pace
C) Add more local / cultural experiences
D) Add must-see highlights
E) Rebalance for a specific traveler"
`;

let chatSession: Chat | null = null;
let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

export const initializeTripChat = async (formData: TripFormData): Promise<string> => {
  const ai = getAiClient();
  
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  const userPrompt = `
  I am ready to plan my trip. Here are my inputs:
  1. Destination(s): ${formData.destination}
  2. Total number of travelers: ${formData.travelers}
  3. Age range or average age: ${formData.ageRange}
  4. Trip duration: ${formData.duration} days ${formData.dateRange ? `(Dates: ${formData.dateRange})` : '(Dates not specified, please suggest best time or assume typical season)'}
  5. Total budget: ${formData.budget}
  6. Preferences: ${formData.preferences}
  
  Please generate the trip plan now according to Phase 3.
  `;

  try {
    const response = await chatSession.sendMessage({ message: userPrompt });
    return response.text;
  } catch (error) {
    console.error("Error generating trip plan:", error);
    throw error;
  }
};

export const refineTripPlan = async (refinement: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized. Please start a plan first.");
  }

  try {
    const response = await chatSession.sendMessage({ message: refinement });
    return response.text;
  } catch (error) {
    console.error("Error refining trip plan:", error);
    throw error;
  }
};