import { Resend } from '@convex-dev/resend';
import { components } from './_generated/api';
import { internalMutation } from './_generated/server';

export const resend: Resend = new Resend(components.resend, {});

export const sendTestEmail = internalMutation({
  handler: async (ctx) => {
    await resend.sendEmail(
      ctx,
      'Me <test@mydomain.com>',
      'Resend <delivered@resend.dev>',
      'Hi there',
      'This is a test email'
    );
  },
});
