export function ErrorPage({ error }: { error: Error }) {
  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-50'>
      <div className='p-8 bg-white rounded-lg shadow-md max-w-2xl w-full mx-4'>
        <h1 className='text-2xl font-bold text-red-600 mb-4'>Error</h1>
        <div className='bg-red-50 border border-red-200 rounded-md p-4'>
          <p className='text-red-800 font-medium mb-2'>Something went wrong:</p>
          <p className='text-gray-700 whitespace-pre-wrap'>{error.message}</p>
        </div>
      </div>
    </div>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorPage error={error} />;
}