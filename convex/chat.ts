import { Agent } from "@convex-dev/agent";
import { components } from "./_generated/api";
import { mutation, query, httpAction } from "./_generated/server";
import { v } from "convex/values";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const agent = new Agent(components.agent, {
  chat: openai.chat('chatgpt-4o-latest') as any
})