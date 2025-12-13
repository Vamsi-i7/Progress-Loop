
import { MockBackend } from "./MockBackend";

export const initiateCheckout = async (plan: 'pro' | 'premium', userId: string) => {
    return new Promise<{ success: boolean, url?: string }>((resolve) => {
        setTimeout(() => {
            // Simulate successful upgrade
            MockBackend.updateUser({ 
                plan: plan,
                subscriptionStatus: 'active',
                aiQuotaLimit: plan === 'premium' ? 10000 : 500,
                uploadsLimit: plan === 'premium' ? 1000 : 50
            });
            
            // In real world, this returns a Stripe Checkout URL
            resolve({ success: true, url: '/subscription?success=true' });
        }, 1500);
    });
};
