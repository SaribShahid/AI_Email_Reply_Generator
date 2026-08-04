function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

      <p className="mt-4 text-gray-600 font-medium">
        AI is generating your reply...
      </p>
    </div>
  );
}

export default Loading;