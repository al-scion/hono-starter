import { Hono } from "hono";
import { streamText, UIMessage, convertToModelMessages, smoothStream } from "ai";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AnthropicProviderOptions } from '@ai-sdk/anthropic';
import { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
// import { OpenAIResponsesProviderOptions } from '@ai-sdk/openai';

const defaultModel = 'openai/gpt-4o-mini';

export const chatRouter = new Hono<{ Bindings: Env }>()
  .post('/stream', zValidator('json', z.object({
    messages: z.array(z.any()),
  })), async (c) => {

      const { messages }: { messages: UIMessage[] } = await c.req.json();
      const modelId = c.req.header('modelid') || defaultModel;
      
      const enabledTools = c.req.header('enabled-tools');
      const enableReasoning = enabledTools?.includes('reasoning');
      const enableWebSearch = enabledTools?.includes('web-search');

      // Convert UIMessages to ModelMessages for the AI SDK
      const modelMessages = convertToModelMessages(messages);

      // Build provider options conditionally based on reasoning toggle
      const anthropicOptions: AnthropicProviderOptions = {
        webSearch: enableWebSearch ? { maxUses: 1 } : undefined,
        ...(enableReasoning && {
          thinking: { type: 'enabled', budgetTokens: 12000 },
        }),
      };

      const googleOptions: GoogleGenerativeAIProviderOptions = {
        useSearchGrounding: enableWebSearch,
        ...(enableReasoning && {
          thinkingConfig: { thinkingBudget: 12000 },
        }),
      };

      // const openaiOptions: OpenAIResponsesProviderOptions = {
      //   ...(enableReasoning && {
      //     reasoningEffort: 'medium',
      //   }),
      // };

      const registry = c.get('registry');
      const result = streamText({
        model: registry.languageModel(modelId as never),
        messages: modelMessages,
        providerOptions: {
          anthropic: anthropicOptions,
          google: googleOptions,
          // openai: openaiOptions,
        },
        experimental_transform: smoothStream()
      });

      // Return the proper UI Message Stream Response for AI SDK v5
      return result.toUIMessageStreamResponse({
        sendReasoning: enableReasoning, 
        sendSources: true,
      });
    }
  )