import { createFileRoute } from '@tanstack/react-router'
import { CreateOrganization } from '@clerk/clerk-react'

export const Route = createFileRoute('/_authenticated/onboarding')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex items-center justify-center h-screen">
      <CreateOrganization hideSlug={true} afterCreateOrganizationUrl='/dashboard' />
    </div>
  )
}
