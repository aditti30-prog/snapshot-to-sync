import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an AI that extracts calendar event information from screenshots of chat conversations.

Analyze the screenshot and extract the most likely primary meeting/event. Return structured data using the provided tool.

Rules:
- If an end time is not mentioned, assume 30 minutes duration.
- If a duration is explicitly mentioned (e.g. "1 hour", "45 minutes"), use that to compute end time.
- If only a date is mentioned without a year, assume the next upcoming occurrence from today.
- If time is not mentioned but a meeting is implied, default start time to 09:00.
- If multiple events appear, choose the most likely primary event.
- Do not support recurring meetings.
- Extract location if mentioned (physical address, Zoom link, Google Meet, etc).
- Extract any relevant notes or context about the meeting.
- Date format: YYYY-MM-DD, Time format: HH:MM (24-hour).
- If you truly cannot find any event, return title as empty string.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64) throw new Error("No image provided");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType || "image/png"};base64,${imageBase64}`,
                  },
                },
                {
                  type: "text",
                  text: `Today's date is ${new Date().toISOString().split("T")[0]}. Extract the event from this screenshot.`,
                },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_event",
                description:
                  "Extract calendar event details from a chat screenshot.",
                parameters: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description: "Event title. Empty string if no event found.",
                    },
                    date: {
                      type: "string",
                      description: "Event date in YYYY-MM-DD format.",
                    },
                    start_time: {
                      type: "string",
                      description:
                        "Start time in HH:MM 24-hour format. Default 09:00 if not mentioned.",
                    },
                    end_time: {
                      type: "string",
                      description:
                        "End time in HH:MM 24-hour format. If not mentioned, add 30 minutes to start time.",
                    },
                    location: {
                      type: "string",
                      description:
                        "Meeting location or video call link if mentioned. Empty string if not found.",
                    },
                    description: {
                      type: "string",
                      description:
                        "Any relevant notes or context about the meeting. Empty string if none.",
                    },
                  },
                  required: [
                    "title",
                    "date",
                    "start_time",
                    "end_time",
                    "location",
                    "description",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "extract_event" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(
        JSON.stringify({ error: "Could not extract event details from this screenshot." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const eventData = JSON.parse(toolCall.function.arguments);

    if (!eventData.title) {
      return new Response(
        JSON.stringify({ error: "No meeting or event detected in this screenshot." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Google Calendar link
    const startDt = eventData.date.replace(/-/g, "") + "T" + eventData.start_time.replace(/:/g, "") + "00";
    const endDt = eventData.date.replace(/-/g, "") + "T" + eventData.end_time.replace(/:/g, "") + "00";

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: eventData.title,
      dates: `${startDt}/${endDt}`,
    });
    if (eventData.description) params.set("details", eventData.description);
    if (eventData.location) params.set("location", eventData.location);

    const calendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;

    return new Response(
      JSON.stringify({
        event: eventData,
        calendarUrl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("extract-event error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
