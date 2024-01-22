import {ArticleTemplateCategory} from 'pages/settings/helpCenter/types/articleTemplates'

export const ARTICLE_TEMPLATE_CATEGORIES = {
    [ArticleTemplateCategory.OrderManagement]: {
        label: 'Order Management',
        style: {
            color: 'var(--accessory-orange-3)',
            background: 'var(--accessory-orange-1)',
        },
    },
    [ArticleTemplateCategory.ReturnsRefunds]: {
        label: 'Returns & Refunds',
        style: {
            color: 'var(--accessory-yellow-3)',
            background: 'var(--accessory-yellow-1)',
        },
    },
    [ArticleTemplateCategory.ShippingDelivery]: {
        label: 'Shipping & Delivery',
        style: {
            color: 'var(--accessory-teal-3)',
            background: 'var(--accessory-teal-1)',
        },
    },
}
