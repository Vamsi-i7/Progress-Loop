
import { FeedbackSubmission } from "../types";

const MAIL_API_KEY = "{{MAIL_API_KEY}}";
const MAIL_FROM = "{{MAIL_FROM}}";

export const sendFeedbackEmail = async (feedback: FeedbackSubmission) => {
    console.log(`[API] Sending feedback email via Mail provider...`);
    console.log(`From: ${MAIL_FROM}, Content: ${feedback.message}`);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 500));
    return { success: true };
};
