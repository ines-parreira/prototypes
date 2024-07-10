import {
    AIArticle,
    AILibraryArticleItem,
    ArticleTemplateType,
    HelpCenterArticleItem,
} from 'models/helpCenter/types'

export const AIArticlesListFixture: AIArticle[] = [
    {
        key: 'ai_Generated_1',
        title: 'AI Generated Article 1',
        html_content: '<h1>AI Generated Article 1</h1>',
        score: 0,
        category: 'General',
        excerpt:
            'Our standard shipping time within [country/region] is [# of days] business days. Shipping charges, if applicable, will be calculated and displayed at checkout...',
        batch_datetime: '1709110371702',
    },
    {
        key: 'ai_Generated_2',
        title: 'AI Generated Article 2',
        html_content: '<h1>AI Generated Article 2</h1>',
        score: 0,
        category: 'General',
        excerpt:
            'Returns must be initiated within [x days] of receiving your order. Items must be unused and in the original packaging...',
        batch_datetime: '1709110371702',
    },
    {
        key: 'ai_Generated_3',
        title: 'How to cancel order',
        html_content: '<h1>How to cancel order</h1>',
        score: 0,
        category: 'Ordering',
        excerpt:
            'You will have the option to cancel your order within your confirmation email. You may also contact our customer service team at [email/phone #]...',
        batch_datetime: '1709110371700',
    },
]

export const AIArticlesRecommendationFixture: AIArticle[] = [
    {
        key: 'ai_Generated_1',
        title: 'AI Generated Article 1',
        html_content: '<h1>AI Generated Article 1</h1>',
        score: 0,
        category: 'General',
        excerpt:
            'Our standard shipping time within [country/region] is [# of days] business days. Shipping charges, if applicable, will be calculated and displayed at checkout...',
        batch_datetime: '1709110371702',
        related_tickets_count: 5,
        review_action: 'publish',
    },
    {
        key: 'ai_Generated_2',
        title: 'AI Generated Article 2',
        html_content: '<h1>AI Generated Article 2</h1>',
        score: 0,
        category: 'General',
        excerpt:
            'Returns must be initiated within [x days] of receiving your order. Items must be unused and in the original packaging...',
        batch_datetime: '1709110371702',
        related_tickets_count: 3,
        review_action: 'archive',
    },
    {
        key: 'ai_Generated_3',
        title: 'How to cancel order',
        html_content: '<h1>How to cancel order</h1>',
        score: 0,
        category: 'Ordering',
        excerpt:
            'You will have the option to cancel your order within your confirmation email. You may also contact our customer service team at [email/phone #]...',
        batch_datetime: '1709110371700',
        related_tickets_count: 8,
    },
]

export const AIArticlesGroupedFixture: Record<string, HelpCenterArticleItem[]> =
    {
        ai: [
            {
                key: 'ai_Generated_1',
                title: 'AI Generated Article 1',
                content: '<h1>AI Generated Article 1</h1>',
                category: 'General',
                type: ArticleTemplateType.AI,
                excerpt:
                    'Our standard shipping time within [country/region] is [# of days] business days. Shipping charges, if applicable, will be calculated and displayed at checkout...',
            },
            {
                key: 'ai_Generated_2',
                title: 'AI Generated Article 2',
                content: '<h1>AI Generated Article 2</h1>',
                category: 'General',
                type: ArticleTemplateType.AI,
                excerpt:
                    'Returns must be initiated within [x days] of receiving your order. Items must be unused and in the original packaging...',
            },
            {
                key: 'ai_Generated_3',
                title: 'How to cancel order',
                content: '<h1>How to cancel order</h1>',
                category: 'Ordering',
                type: ArticleTemplateType.AI,
                excerpt:
                    'You will have the option to cancel your order within your confirmation email. You may also contact our customer service team at [email/phone #]...',
            },
        ],
    }

export const AILibraryArticleItemsFixture: AILibraryArticleItem[] = [
    {
        key: 'ai_Generated_1',
        title: 'AI Generated Article 1',
        html_content: '<h1>AI Generated Article 1</h1>',
        score: 0,
        isNew: true,
        category: 'General',
        excerpt:
            'Our standard shipping time within [country/region] is [# of days] business days. Shipping charges, if applicable, will be calculated and displayed at checkout...',
        batch_datetime: '1709110371702',
    },
    {
        key: 'ai_Generated_2',
        title: 'AI Generated Article 2',
        html_content: '<h1>AI Generated Article 2</h1>',
        score: 0,
        isNew: true,
        category: 'General',
        excerpt:
            'Returns must be initiated within [x days] of receiving your order. Items must be unused and in the original packaging...',
        batch_datetime: '1709110371702',
    },
    {
        key: 'ai_Generated_3',
        title: 'How to cancel order',
        html_content: '<h1>How to cancel order</h1>',
        score: 0,
        isNew: false,
        category: 'Ordering',
        excerpt:
            'You will have the option to cancel your order within your confirmation email. You may also contact our customer service team at [email/phone #]...',
        batch_datetime: '1709110371700',
    },
]

export const AIArticlesEmptyListFixture = []

export const AIArticlesGeneric500ErrorFixture = {
    error: {
        msg: 'An error occurred',
    },
    status: 500,
    code: 'INTERNAL_SERVER_ERROR_EXCEPTION',
    message: 'An error occurred',
} as const
