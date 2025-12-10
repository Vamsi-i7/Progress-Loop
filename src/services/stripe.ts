
import { createCheckoutSession } from '../api/stripe';
import { MockBackend } from './MockBackend';

export const initiateCheckout = async (plan: 'pro' | 'premium', userId: string) => {
    const priceMap = {
        'pro': 'price_pro_monthly',
        'premium': 'price_premium_monthly'
    };
    
    try {
        const session = await createCheckoutSession(priceMap[plan], userId);
        
        // In a real app, we would redirect:
        // window.location.href = session.url;
        
        // For this demo, we simulate success immediately since we can't leave the preview
        MockBackend.updateUser({ 
            plan: plan,
            subscriptionStatus: 'active',
            aiQuotaLimit: plan === 'premium' ? 500 : 100
        });
        
        return { success: true, url: session.url };
    } catch (e) {
        console.error("Stripe Checkout Error", e);
        return { success: false, error: 'Checkout failed' };
    }
};
