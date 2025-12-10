
import { User, StudyPlan, ScheduledBlock, ChatMessage } from '../types';

export const getMentorResponse = (
    user: User, 
    plans: StudyPlan[], 
    schedule: ScheduledBlock[], 
    lastMessage: string
): ChatMessage => {
    const lowerMsg = lastMessage.toLowerCase();
    let responseText = "";

    // Feature 15: Context-aware responses
    if (lowerMsg.includes("tired") || lowerMsg.includes("overwhelmed")) {
        responseText = "I noticed your cognitive load is high today. I've enabled 'Focus Mode' to break your next task into 25-minute chunks. Take a 5-minute breather first.";
    } else if (lowerMsg.includes("exam") || lowerMsg.includes("prepare")) {
        if (user.survivalMode) {
             responseText = "We are already in Survival Mode. Stick to the highlighted high-weightage topics in Physics. You can do this!";
        } else {
             responseText = "I can activate 'Exam Survival Mode' if you're crunching for time. It will compress your schedule and prioritize high-marks topics. Want me to turn it on?";
        }
    } else if (lowerMsg.includes("schedule") || lowerMsg.includes("plan")) {
        const nextTaskBlock = schedule.find(b => new Date(b.start) > new Date());
        if (nextTaskBlock) {
             const task = plans.flatMap(p => p.tasks).find(t => t.id === nextTaskBlock.taskId);
             responseText = `Your schedule is optimized. Next up is '${task?.title}' at ${new Date(nextTaskBlock.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}.`;
        } else {
             responseText = "Your schedule looks clear for now. Great time for a quick revision session? I can generate one for you.";
        }
    } else if (lowerMsg.includes("fail") || lowerMsg.includes("risk")) {
         responseText = "Don't worry. I've analyzed your weak spots. We can reschedule tomorrow's load to give you more buffer time for the Physics assignment.";
    } else {
        responseText = "I'm analyzing your performance patterns. You seem to work best in the mornings. Try to shift your heavy Calculus tasks to 9 AM.";
    }

    return {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toISOString()
    };
};
