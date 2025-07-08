import { httpAction, query } from "./_generated/server";
import { internal, components } from "./_generated/api";
import { PersistentTextStreaming, StreamId, StreamIdValidator } from "@convex-dev/persistent-text-streaming";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const streamingComponent = new PersistentTextStreaming(
  components.persistentTextStreaming
);

export const getStreamBody = query({
  args: {
    streamId: StreamIdValidator,
  },
  handler: async (ctx, args) => {
    return await streamingComponent.getStreamBody(
      ctx,
      args.streamId as StreamId
    );
  },
});

export const streamChat = httpAction(async (ctx, request) => {
  const body = (await request.json()) as {
    streamId: string;
  };

  // Start streaming and persisting at the same time while
  // we immediately return a streaming response to the client
  const response = await streamingComponent.stream(
    ctx,
    request,
    body.streamId as StreamId,
    async (ctx, request, streamId, append) => {

      const stream = await streamText({
        model: openai("gpt-4o-mini"),
        system: "You are a helpful assistant that can answer questions and help with tasks. Please provide your response in markdown format.",
        messages: [
          { role: "user", content: "Hello, how are you?" },
        ],
      });

      stream.toUIMessageStreamResponse({
        sendReasoning: false,
        sendSources: false,
      })

    }
  );

  return response;
});