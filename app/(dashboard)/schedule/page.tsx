// This creates the route /schedule

export default function SchedulePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Construction Schedule</h1>
                    <div className="h-[800px] flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center">
                            <div className="text-6xl text-gray-400 mb-4">📅</div>
                            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Schedule Coming Soon</h2>
                            <p className="text-gray-600 max-w-md">
                                The construction schedule feature is currently being developed. 
                                This will include interactive Gantt charts, task management, 
                                and purchase order integration.
                            </p>
                            <div className="mt-6 space-y-2 text-sm text-gray-500">
                                <p>• Interactive timeline view</p>
                                <p>• Task dependencies and critical path</p>
                                <p>• Purchase order status tracking</p>
                                <p>• Progress monitoring</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}