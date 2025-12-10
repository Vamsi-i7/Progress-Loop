
import { StudyPlan, PlanTask } from '../types';
import { addMinutes } from '../utils/dateMath';

/**
 * Simulates AI ingestion of a PDF/Image syllabus.
 * Detects subject context from filename and generates a structured study plan
 * with Units, Topics, Deadlines, Weightage, and Study Hours.
 */
export const parseSyllabus = async (file: File): Promise<StudyPlan> => {
    return new Promise((resolve) => {
        // Simulate processing delay (OCR + AI Analysis)
        setTimeout(() => {
            const now = new Date();
            const planId = `p_syllabus_${Date.now()}`;
            const fileName = file.name.toLowerCase();
            
            let subject = 'General';
            let tasks: PlanTask[] = [];

            // Smart detection based on filename keywords
            if (fileName.includes('math') || fileName.includes('calculus') || fileName.includes('algebra')) {
                subject = 'Mathematics';
                tasks = [
                     { 
                         id: `${planId}_t1`, 
                         title: 'Unit 1: Limits & Continuity', 
                         isCompleted: false, 
                         estimatedMinutes: 120, // 2 Hours
                         difficulty: 'medium', 
                         subjectWeightage: 15, // 15% Marks
                         dueDate: addMinutes(now, 24 * 60 * 3).toISOString() 
                     },
                     { 
                         id: `${planId}_t2`, 
                         title: 'Unit 2: Derivatives & Applications', 
                         isCompleted: false, 
                         estimatedMinutes: 180, // 3 Hours
                         difficulty: 'hard', 
                         subjectWeightage: 35, 
                         dueDate: addMinutes(now, 24 * 60 * 7).toISOString() 
                     },
                     { 
                         id: `${planId}_t3`, 
                         title: 'Unit 3: Integration Techniques', 
                         isCompleted: false, 
                         estimatedMinutes: 150, 
                         difficulty: 'hard', 
                         subjectWeightage: 30, 
                         dueDate: addMinutes(now, 24 * 60 * 14).toISOString() 
                     },
                     { 
                         id: `${planId}_t4`, 
                         title: 'Unit 4: Differential Equations', 
                         isCompleted: false, 
                         estimatedMinutes: 90, 
                         difficulty: 'medium', 
                         subjectWeightage: 20, 
                         dueDate: addMinutes(now, 24 * 60 * 21).toISOString() 
                     }
                ];
            } else if (fileName.includes('phys') || fileName.includes('science')) {
                subject = 'Physics';
                tasks = [
                    { 
                        id: `${planId}_t1`, 
                        title: 'Module 1: Kinematics 1D & 2D', 
                        isCompleted: false, 
                        estimatedMinutes: 90, 
                        difficulty: 'medium', 
                        subjectWeightage: 15, 
                        dueDate: addMinutes(now, 24 * 60 * 3).toISOString() 
                    },
                    { 
                        id: `${planId}_t2`, 
                        title: 'Module 2: Newton\'s Laws of Motion', 
                        isCompleted: false, 
                        estimatedMinutes: 120, 
                        difficulty: 'hard', 
                        subjectWeightage: 25, 
                        dueDate: addMinutes(now, 24 * 60 * 6).toISOString() 
                    },
                    { 
                        id: `${planId}_t3`, 
                        title: 'Module 3: Work, Energy & Power', 
                        isCompleted: false, 
                        estimatedMinutes: 100, 
                        difficulty: 'medium', 
                        subjectWeightage: 20, 
                        dueDate: addMinutes(now, 24 * 60 * 10).toISOString() 
                    },
                     { 
                        id: `${planId}_t4`, 
                        title: 'Module 4: Thermodynamics', 
                        isCompleted: false, 
                        estimatedMinutes: 150, 
                        difficulty: 'hard', 
                        subjectWeightage: 40, 
                        dueDate: addMinutes(now, 24 * 60 * 20).toISOString() 
                    }
                ];
            } else if (fileName.includes('hist') || fileName.includes('social')) {
                 subject = 'History';
                 tasks = [
                    { 
                        id: `${planId}_t1`, 
                        title: 'Era 1: Industrial Revolution', 
                        isCompleted: false, 
                        estimatedMinutes: 60, 
                        difficulty: 'easy', 
                        subjectWeightage: 20, 
                        dueDate: addMinutes(now, 24 * 60 * 2).toISOString() 
                    },
                    { 
                        id: `${planId}_t2`, 
                        title: 'Era 2: World War I Causes', 
                        isCompleted: false, 
                        estimatedMinutes: 90, 
                        difficulty: 'medium', 
                        subjectWeightage: 30, 
                        dueDate: addMinutes(now, 24 * 60 * 5).toISOString() 
                    },
                    { 
                        id: `${planId}_t3`, 
                        title: 'Era 3: Cold War Politics', 
                        isCompleted: false, 
                        estimatedMinutes: 120, 
                        difficulty: 'hard', 
                        subjectWeightage: 50, 
                        dueDate: addMinutes(now, 24 * 60 * 10).toISOString() 
                    }
                 ];
            } else if (fileName.includes('chem')) {
                subject = 'Chemistry';
                tasks = [
                    { id: `${planId}_t1`, title: 'Atomic Structure', isCompleted: false, estimatedMinutes: 60, difficulty: 'medium', subjectWeightage: 15, dueDate: addMinutes(now, 24 * 60 * 2).toISOString() },
                    { id: `${planId}_t2`, title: 'Chemical Bonding', isCompleted: false, estimatedMinutes: 90, difficulty: 'hard', subjectWeightage: 20, dueDate: addMinutes(now, 24 * 60 * 5).toISOString() },
                    { id: `${planId}_t3`, title: 'Stoichiometry', isCompleted: false, estimatedMinutes: 90, difficulty: 'medium', subjectWeightage: 15, dueDate: addMinutes(now, 24 * 60 * 8).toISOString() }
                ];
            } else {
                subject = 'General Study';
                tasks = [
                    { 
                        id: `${planId}_t1`, 
                        title: 'Chapter 1: Introduction & Concepts', 
                        isCompleted: false, 
                        estimatedMinutes: 45, 
                        difficulty: 'easy', 
                        subjectWeightage: 10, 
                        dueDate: addMinutes(now, 24 * 60 * 2).toISOString() 
                    },
                    { 
                        id: `${planId}_t2`, 
                        title: 'Chapter 2: Core Methodology', 
                        isCompleted: false, 
                        estimatedMinutes: 90, 
                        difficulty: 'medium', 
                        subjectWeightage: 30, 
                        dueDate: addMinutes(now, 24 * 60 * 5).toISOString() 
                    },
                    { 
                        id: `${planId}_t3`, 
                        title: 'Chapter 3: Advanced Applications', 
                        isCompleted: false, 
                        estimatedMinutes: 120, 
                        difficulty: 'hard', 
                        subjectWeightage: 60, 
                        dueDate: addMinutes(now, 24 * 60 * 9).toISOString() 
                    }
                ];
            }

            const plan: StudyPlan = {
                id: planId,
                title: `Syllabus: ${file.name.replace(/\.[^/.]+$/, "")}`, // Remove extension
                subject: subject,
                startDate: now.toISOString().split('T')[0],
                endDate: addMinutes(now, 24 * 60 * 30).toISOString().split('T')[0],
                priority: 'high',
                tasks: tasks
            };

            resolve(plan);
        }, 2000); // 2-second simulated delay
    });
};
