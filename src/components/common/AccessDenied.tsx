import React from 'react';
import { Lock } from 'lucide-react';

const AccessDenied = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-2xl border border-gray-200 text-center p-8">
            <div className="bg-red-100 p-4 rounded-full mb-4">
                <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-500 max-w-sm">
                You do not have permission to view this student's academic data.
                If you are their mentor, please request access from the student.
            </p>
        </div>
    );
};

export default AccessDenied;
