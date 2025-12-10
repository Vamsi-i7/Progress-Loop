
// Serverless function mock
const MAIL_API_KEY = "{{MAIL_API_KEY}}";

export const sendInviteEmail = async (email: string, inviteLink: string, inviterName: string, groupName: string) => {
    console.log(`[API] Sending invite email to ${email}`);
    
    if (!MAIL_API_KEY || MAIL_API_KEY.includes('{{')) {
        console.warn('[API] Mail API Key missing. Skipping email send.');
        return { success: true, mocked: true };
    }

    // In production, call SendGrid/Mailgun etc.
    const emailBody = `
        Hi there!
        
        ${inviterName} has invited you to join the study group "${groupName}" on Progress Loop.
        
        Click here to join: ${inviteLink}
        
        Happy Studying!
    `;

    console.log(`[API] Email Content:`, emailBody);
    
    await new Promise(r => setTimeout(r, 500));
    return { success: true };
};
