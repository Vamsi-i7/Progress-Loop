
import { Transaction } from "../types";
import { MockBackend } from "./MockBackend";

export interface PaymentRequest {
    cardNumber: string;
    expiry: string;
    cvc: string;
    amount: number;
    plan: 'pro' | 'premium';
}

export interface PaymentResponse {
    success: boolean;
    transactionId?: string;
    error?: string;
}

class PaymentGatewayService {
    
    async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
        return new Promise((resolve) => {
            // Simulate Network Delay
            setTimeout(() => {
                // Mock Validation
                const cleanCard = request.cardNumber.replace(/\s/g, '');
                
                if (cleanCard.length < 16) {
                    resolve({ success: false, error: 'Invalid card number' });
                    return;
                }

                if (request.cvc.length < 3) {
                    resolve({ success: false, error: 'Invalid CVC' });
                    return;
                }

                // Simulate Success Rate (90% success)
                const isSuccess = Math.random() > 0.1;

                if (isSuccess) {
                    const tid = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                    
                    // Log to Backend
                    const transaction: Transaction = {
                        id: tid,
                        date: new Date().toISOString().split('T')[0],
                        amount: request.amount,
                        currency: 'INR',
                        plan: request.plan,
                        status: 'success',
                        invoiceUrl: '#'
                    };
                    
                    MockBackend.addTransaction(transaction);
                    
                    resolve({ success: true, transactionId: tid });
                } else {
                    resolve({ success: false, error: 'Card declined by bank' });
                }
            }, 2500); // 2.5s simulated delay
        });
    }
}

export const PaymentGateway = new PaymentGatewayService();
