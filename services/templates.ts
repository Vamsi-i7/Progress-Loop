import { SmartTemplate } from "../types";

export const COURSE_TEMPLATES: SmartTemplate[] = [
    { 
        id: 't_jee', 
        name: 'JEE Main Advanced', 
        description: 'Intensive Physics, Chemistry, Math load designed for engineering aspirants.', 
        subjects: ['Physics', 'Chemistry', 'Math'] 
    },
    { 
        id: 't_neet', 
        name: 'NEET Medical Prep', 
        description: 'Biology-heavy schedule with Physics and Chemistry balance.', 
        subjects: ['Biology', 'Physics', 'Chemistry'] 
    },
    { 
        id: 't_cse', 
        name: 'CSE Semester Bundle', 
        description: 'Standard Computer Science semester load.', 
        subjects: ['Data Structures', 'Operating Systems', 'DBMS', 'Discrete Math'] 
    },
    { 
        id: 't_gate', 
        name: 'GATE CS Priority', 
        description: 'High-weightage subjects prioritized for GATE exam.', 
        subjects: ['Algorithms', 'Theory of Comp', 'Computer Networks'] 
    },
    { 
        id: 't_weekend', 
        name: 'Weekend Warrior', 
        description: 'Condensed revision schedule for Sat-Sun.', 
        subjects: ['Revision', 'Practice Tests'] 
    }
];
