import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_layout/direct-message')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-col h-full overflow-auto bg-blue-100 space-y-200'>
      <div>Hello "/_authenticated/_layout/direct-message"!</div>
      <div>Hello "/_authenticated/_layout/direct-message"!</div>
      <div>Hello "/_authenticated/_layout/direct-message"!</div>
    </div>
  );
}
