export function TableSkeleton() {
  return (
    <div className="mt-6 space-y-4 animate-pulse">
      {/* Summary skeleton */}
      <div className="flex gap-2">
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Result cards skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          {/* Header */}
          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 dark:bg-gray-700" />

          {/* Guide matches */}
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded space-y-2">
              <div className="flex justify-between">
                <div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="flex gap-2 mt-2">
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
