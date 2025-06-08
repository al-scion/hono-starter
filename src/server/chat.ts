import { Hono } from "hono";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const chatRouter = new Hono<{ Bindings: Env }>()
  .post('/', zValidator('json', z.object({
    messages: z.array(z.any()),
  })), async (c) => {
      const { messages }: { messages: UIMessage[] } = await c.req.json();
      
      // Convert UIMessages to ModelMessages for the AI SDK
      const modelMessages = convertToModelMessages(messages);

      const registry = c.get('registry');
      const result = streamText({
        model: registry.languageModel('openai/gpt-4o-mini'),
        messages: modelMessages,
      });

      // Return the proper UI Message Stream Response for AI SDK v5
      return result.toUIMessageStreamResponse();
    }
  )