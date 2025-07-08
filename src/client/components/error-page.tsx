export function ErrorPage({ error }: { error: Error }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mx-4 w-full max-w-2xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 font-bold text-2xl text-red-600">Error</h1>
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="mb-2 font-medium text-red-800">Something went wrong:</p>
          <p className="whitespace-pre-wrap text-gray-700">{error.message}</p>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorPage error={error} />;
}
