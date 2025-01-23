export const previews = {
    billingAndPayment: {
        category: 'support',
        title: 'Billing and Payments',
        caption:
            'Provide informations about prices, payments methods or invoices.',
    },
    orderStatusAndTracking: {
        category: 'support',
        title: 'Order Status and Tracking',
        caption:
            'Provide information about order status or shipment tracking details.',
    },
    orderReturns: {
        category: 'support',
        title: 'Order Returns',
        caption: 'Inquire about requirements & process to return a product.',
    },
    orderCancelation: {
        category: 'support',
        title: 'Order Cancelation',
        caption: 'Inquire about requirements & process to cancel an order.',
    },
    productRecommendations: {
        category: 'sales',
        title: 'Product Recommendations',
        caption: 'Inquire about product specifications or recommendations.',
    },
    stockRequests: {
        category: 'sales',
        title: 'Stock Requests',
        caption:
            'Inquire about product availability or back to stocks notifications.',
    },
    sizeQuestions: {
        category: 'sales',
        title: 'Size Questions',
        caption: 'Inquire about sizing to avoid getting returns.',
    },
    discountCode: {
        category: 'sales',
        title: 'Discount Code',
        caption:
            'Inquire about current promotions or troubleshooting discount codes not working.',
    },
} as const
export type PreviewId = keyof typeof previews
export type Preview = (typeof previews)[PreviewId]

export const mixedPreviews = [
    previews.productRecommendations,
    previews.discountCode,
    previews.orderStatusAndTracking,
    previews.orderCancelation,
]
export const salesPreviews = [
    previews.productRecommendations,
    previews.stockRequests,
    previews.sizeQuestions,
    previews.discountCode,
]
export const supportPreviews = [
    previews.billingAndPayment,
    previews.orderStatusAndTracking,
    previews.orderReturns,
    previews.orderCancelation,
]

export const getPreviewsForPreviewType = (
    previewType: 'mixed' | 'sales' | 'support'
) => {
    if (previewType === 'sales') {
        return salesPreviews
    } else if (previewType === 'support') {
        return supportPreviews
    }
    return mixedPreviews
}
