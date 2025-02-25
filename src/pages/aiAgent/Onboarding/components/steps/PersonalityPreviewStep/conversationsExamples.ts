import { ConversationMessage } from 'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation'
import { PreviewId } from 'pages/aiAgent/Onboarding/components/PersonalityPreviewGroup/constants'

export const conversationExamples: Record<
    PreviewId,
    { messages: ConversationMessage[] }
> = {
    billingAndPayment: {
        messages: [
            {
                content:
                    'Hi, can I check the payment method I used for my last order?',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
            {
                content:
                    'Sure! You paid using your credit card ending in **1234**. Would you like a receipt sent to your email?',
                isHtml: true,
                fromAgent: true,
                attachments: [],
            },
            {
                content: 'Yes, please send it to my registered email.',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
            {
                content:
                    'Done! The receipt has been emailed to you. Let me know if you need anything else.',
                isHtml: true,
                fromAgent: true,
                attachments: [],
            },
        ],
    },
    orderStatusAndTracking: {
        messages: [
            {
                content: 'Where is my package? It seems delayed.',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
            {
                content:
                    'I see your package is currently at the local sorting facility and is expected to be delivered tomorrow. Here’s your tracking link: <a href="https://example.com/track" target="_blank">Track Package</a>.',
                isHtml: true,
                fromAgent: true,
                attachments: [],
            },
            {
                content: 'Okay, that’s great to know.',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
            {
                content: 'I’ll monitor the delivery. Thanks for your help!',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
            {
                content: 'You’re welcome! 😊',
                isHtml: true,
                fromAgent: true,
                attachments: [],
            },
        ],
    },
    orderReturns: {
        messages: [
            {
                content:
                    'I’d like to return a pair of shoes. What’s the process?',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
            {
                content:
                    'Returning is simple! You can start here: <a href="https://example.com/returns" target="_blank">Return Item</a>. Please make sure the item is unused and in its original packaging.',
                isHtml: true,
                fromAgent: true,
                attachments: [],
            },
            {
                content: 'Got it. Do I need to pay for return shipping?',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
            {
                content:
                    'Return shipping is free! You’ll receive a prepaid label when you start the return process.',
                isHtml: true,
                fromAgent: true,
                attachments: [],
            },
            {
                content: 'Perfect, thank you!',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
        ],
    },
    orderCancelation: {
        messages: [
            {
                content:
                    'Can I still cancel my order? It was placed yesterday.',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
            {
                content:
                    'Yes, your order is still processing and can be canceled. Please visit: <a href="https://example.com/cancel" target="_blank">Cancel Order</a>. Would you like me to guide you through it?',
                isHtml: true,
                fromAgent: true,
                attachments: [],
            },
            {
                content:
                    'No need, I’ll handle it. Thanks for the quick response!',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
        ],
    },
    productRecommendations: {
        messages: [
            {
                content: 'What’s the best moisturizer for dry skin?',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
            {
                content:
                    'Our top pick is the <strong>Ultra Hydration Cream</strong>. It’s packed with natural ingredients to combat dryness. Check it out here: <a href="https://example.com/moisturizer" target="_blank">View Product</a>.',
                isHtml: true,
                fromAgent: true,
                attachments: [],
            },
            {
                content: 'Is it safe for sensitive skin?',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
            {
                content:
                    'Yes! It’s dermatologist-tested and free of irritants like parabens and fragrance.',
                isHtml: true,
                fromAgent: true,
                attachments: [],
            },
            {
                content: 'Perfect, I’ll order it. Thanks for your help!',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
        ],
    },
    stockRequests: {
        messages: [
            {
                content: 'When will the black backpack be back in stock?',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
            {
                content:
                    'The black backpack will be back in stock next week. You can sign up for a notification here: <a href="https://example.com/notify" target="_blank">Notify Me</a>.',
                isHtml: true,
                fromAgent: true,
                attachments: [],
            },
            {
                content: 'Thanks, I’ll sign up!',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
        ],
    },
    sizeQuestions: {
        messages: [
            {
                content: 'What size should I pick for your slim fit pants?',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
            {
                content:
                    'If you’re between sizes, we recommend going up for comfort. Here’s our size guide: <a href="https://example.com/size-guide" target="_blank">Size Guide</a>.',
                isHtml: true,
                fromAgent: true,
                attachments: [],
            },
            {
                content: 'Thanks! Does the fabric stretch over time?',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
            {
                content:
                    'Yes, the fabric has a slight stretch for added comfort, but it maintains its fit over time.',
                isHtml: true,
                fromAgent: true,
                attachments: [],
            },
        ],
    },
    discountCode: {
        messages: [
            {
                content:
                    'I tried using a discount code, but it says it’s invalid.',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
            {
                content:
                    'I’m sorry about that! Could you confirm the code you’re using? Here’s a valid code you can try: <strong>WELCOME10</strong> for 10% off.',
                isHtml: true,
                fromAgent: true,
                attachments: [],
            },
            {
                content: 'I’ll give it a shot. Thanks!',
                isHtml: false,
                fromAgent: false,
                attachments: [],
            },
            {
                content:
                    'You’re welcome! Let me know if you face any other issues.',
                isHtml: true,
                fromAgent: true,
                attachments: [],
            },
        ],
    },
} as const

export const getConversationByPreviewId = (previewId: PreviewId) =>
    conversationExamples[previewId]
