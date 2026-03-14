'use client';

// Mock dashboard for UI demonstration
// In production this would fetch from /api/clinician/cases

export default function ClinicianDashboard() {
    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Clinician Dashboard</h1>
                    <p className="text-slate-500">KIIT Student Mental Health Screening</p>
                </div>
                <button className="bg-white text-slate-600 px-4 py-2 rounded shadow hover:bg-slate-50">
                    Logout
                </button>
            </header>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                    <h3 className="text-slate-500 text-sm font-semibold uppercase">Immediate Action</h3>
                    <p className="text-3xl font-bold text-red-600">3</p>
                    <p className="text-xs text-slate-400 mt-1">Red Flag Cases</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
                    <h3 className="text-slate-500 text-sm font-semibold uppercase">Priority Review</h3>
                    <p className="text-3xl font-bold text-orange-600">12</p>
                    <p className="text-xs text-slate-400 mt-1">Orange Level Cases</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-400">
                    <h3 className="text-slate-500 text-sm font-semibold uppercase">Monitor</h3>
                    <p className="text-3xl font-bold text-yellow-600">45</p>
                    <p className="text-xs text-slate-400 mt-1">Yellow Level Cases</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800">Recent High Risk Flags</h2>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <th className="px-6 py-3">Case ID</th>
                            <th className="px-6 py-3">Risk Level</th>
                            <th className="px-6 py-3">Time</th>
                            <th className="px-6 py-3">Primary Factor</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-mono text-sm text-slate-600">#8392-A</td>
                            <td className="px-6 py-4"><span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">RED</span></td>
                            <td className="px-6 py-4 text-sm text-slate-600">2 mins ago</td>
                            <td className="px-6 py-4 text-sm">Suicide Risk (Q10/Q32)</td>
                            <td className="px-6 py-4 text-sm text-red-600 font-medium">Unresolved</td>
                            <td className="px-6 py-4"><button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">View & Escalate</button></td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-mono text-sm text-slate-600">#9921-C</td>
                            <td className="px-6 py-4"><span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">ORANGE</span></td>
                            <td className="px-6 py-4 text-sm text-slate-600">1 hour ago</td>
                            <td className="px-6 py-4 text-sm">Severe Anhedonia</td>
                            <td className="px-6 py-4 text-sm text-green-600">Contacted</td>
                            <td className="px-6 py-4"><button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">Review Notes</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
