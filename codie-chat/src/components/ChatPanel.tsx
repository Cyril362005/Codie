export default function ChatPanel() {
  return (
    <div className="h-full p-4 rounded-xl bg-gray-800/50 backdrop-blur-lg border border-gray-700 shadow-md flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-white">Codie Chat</h3>
      <div className="flex-1 overflow-y-auto space-y-3 text-sm">
        <div className="bg-gray-700/50 p-3 rounded-md text-white max-w-[80%]">
          Hi! I'm Codie. I've finished analyzing your project. Your top refactoring candidate is `src/utils/calculations.py`. Would you like a refactoring plan?
        </div>
         <div className="flex justify-end">
            <div className="bg-blue-600 p-3 rounded-md text-white max-w-[80%]">
                Yes, please explain the risks associated with that file.
            </div>
        </div>
      </div>
      <div className="mt-4 flex">
        <input
            type="text"
            placeholder="Ask Codie a question..."
            className="flex-1 px-3 py-2 rounded-l-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-4 py-2 bg-blue-600 rounded-r-md font-semibold hover:bg-blue-700">Send</button>
      </div>
    </div>
  );
}