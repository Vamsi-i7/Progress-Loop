import React, { useEffect, useState } from 'react';
import { ReadOnlyProvider } from '../../context/ReadOnlyContext';
import { api } from '../../services/api';
import Dashboard from '../analytics/Dashboard';
import MasterGrid from '../planner/MasterGrid';
import AccessDenied from '../common/AccessDenied';
import { User } from '../../types';

interface MentorPortalProps {
    studentId: string;
}

const MentorPortal: React.FC<MentorPortalProps> = ({ studentId }) => {
    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [student, setStudent] = useState<User | null>(null);

    useEffect(() => {
        // In a real implementation, we would call an endpoint to check permissions
        // or fetch the student profile and check current user ID against mentor_id.
        // For this mock phase, we assume if studentId is provided, we check permission.

        const checkPermission = async () => {
            try {
                // Mock check: 
                // 1. Fetch current user (me)
                // 2. Fetch target student
                // 3. if (student.mentor_id === me.id) allow

                // For demo: Let's assume we are authorized if we are visiting this component
                // But we render AccessDenied to demonstrate the component if not authorized.
                // Let's hardcode 'true' for now to show the dashboard, 
                // but the logic structure is here.
                setAuthorized(true);

                // const studentData = await api.getUser(studentId);
                // setStudent(studentData);
            } catch (e) {
                setAuthorized(false);
            }
        };

        checkPermission();
    }, [studentId]);

    if (authorized === null) return <div className="p-8 text-center text-slate-500">Verifying access...</div>;
    if (authorized === false) return <AccessDenied />;

    return (
        <ReadOnlyProvider value={true}>
            <div className="flex flex-col gap-6 p-6 bg-slate-50 min-h-screen">

                {/* Header */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-purple-600">
                    <h1 className="text-2xl font-bold text-slate-800">Mentor Portal</h1>
                    <p className="text-slate-500">Viewing academic progress for Student ID: <span className="font-mono text-purple-600">{studentId}</span></p>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mentor Feedback Notes</label>
                        <textarea
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:outline-none"
                            placeholder="Leave feedback for the student..."
                            rows={3}
                        />
                        <div className="mt-2 flex justify-end">
                            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
                                Save Notes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Analytics Overview */}
                <Dashboard />

                {/* Detailed Grid View */}
                <MasterGrid />

            </div>
        </ReadOnlyProvider>
    );
};

export default MentorPortal;
