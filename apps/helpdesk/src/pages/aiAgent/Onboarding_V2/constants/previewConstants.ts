// Minimal preview constants for PersonalityStep conversation previews
export type PreviewId =
    | 'default'
    | 'noDiscountEducational'
    | 'noDiscountBalanced'
    | 'noDiscountAggressive'
    | 'withDiscountEducational'
    | 'withDiscountBalanced'
    | 'withDiscountAggressive'
    // Legacy IDs kept for conversationExamples compatibility
    | 'billingAndPayment'
    | 'orderStatusAndTracking'
    | 'orderReturns'
    | 'orderCancelation'
    | 'productRecommendations'
    | 'stockRequests'
    | 'sizeQuestions'
    | 'discountCode'

export const PRODUCT_RECOMMENDATION_MESSAGE_ID = 'productRecommendationCard'
