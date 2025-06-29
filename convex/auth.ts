import { AuthFunctions, BetterAuth, convexAdapter } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { organization } from "better-auth/plugins"
import { components, internal } from "./_generated/api";
import { betterAuth } from "better-auth";
import { GenericCtx, query } from "./_generated/server";
import { requireEnv } from "./util";
import { Id } from "./_generated/dataModel";

const authFunctions: AuthFunctions = internal.auth;
const siteUrl = requireEnv("SITE_URL");

export const betterAuthComponent = new BetterAuth(components.betterAuth, {
  authFunctions,
  verbose: true,
});

export const createAuth = (ctx: GenericCtx) =>
  betterAuth({
    trustedOrigins: [siteUrl],
    database: convexAdapter(ctx, betterAuthComponent),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    socialProviders: {
      google: {
        clientId: requireEnv("GOOGLE_CLIENT_ID"),
        clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
      },
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    plugins: [
      crossDomain({ siteUrl }),
      convex(),
      organization(),
    ],
    // logger: {
    //   level: "debug",
    // },
    account: {
      accountLinking: {
        enabled: true,
      },
    },
  });

export const { createUser, deleteUser, updateUser, createSession } =
  betterAuthComponent.createAuthFunctions({
    onCreateUser: async (ctx, user) => {
      const userId = await ctx.db.insert("users", {
        email: user.email,
      });
      return userId;
    },
    onDeleteUser: async (ctx, userId) => {
      await ctx.db.delete(userId as Id<"users">);
    },
    onUpdateUser: async (ctx, user) => {
      await ctx.db.patch(user.userId as Id<"users">, {
        email: user.email,
      });
    },
  });

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get user data from Better Auth - email, name, image, etc.
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata) return null
    
    const user = await ctx.db.get(userMetadata.userId as Id<"users">);
    return {
      ...user,
      ...userMetadata,
    };
  },
});