import { CreateOrganization } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/onboarding')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen items-center justify-center">
      <CreateOrganization
        afterCreateOrganizationUrl="/dashboard"
        hideSlug={true}
      />
    </div>
  );
}
