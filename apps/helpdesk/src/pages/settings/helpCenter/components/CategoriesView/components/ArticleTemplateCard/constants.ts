import { ArticleTemplateType } from 'models/helpCenter/types'
import { ArticleTemplateCategory } from 'pages/settings/helpCenter/types/articleTemplates'

export const ARTICLE_TEMPLATE_CATEGORIES: Record<
    string,
    {
        label: string
        style?: { color: string; background: string }
        tooltip?: string
        icon?: { name: string; color: string }
    }
> = {
    [ArticleTemplateCategory.AccountAndSubscriptions]: {
        label: 'Account & Subscriptions',
        style: {
            color: 'var(--accessory-magenta-3)',
            background: 'var(--accessory-magenta-1)',
        },
    },
    [ArticleTemplateCategory.OrderIssues]: {
        label: 'Order Issues',
        style: {
            color: 'var(--neutral-grey-6)',
            background: 'var(--neutral-grey-3)',
        },
    },
    [ArticleTemplateCategory.OrderManagement]: {
        label: 'Order Management',
        style: {
            color: 'var(--accessory-orange-3)',
            background: 'var(--accessory-orange-1)',
        },
    },
    [ArticleTemplateCategory.PaymentsAndDiscounts]: {
        label: 'Payments & Discounts',
        style: {
            color: 'var(--accessory-blue-3)',
            background: 'var(--accessory-blue-1)',
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
    [ArticleTemplateType.Template]: {
        label: 'Standard article templates',
        tooltip:
            'The template language is based on the default language set in Step 1.',
    },
    [ArticleTemplateType.AI]: {
        label: 'Articles for you',
        tooltip: 'AI articles are available only in English',
        icon: { name: 'auto_awesome', color: 'var(--accessory-magenta-3)' },
    },
}

export const MAXIMUM_AI_ARTICLES = 5
