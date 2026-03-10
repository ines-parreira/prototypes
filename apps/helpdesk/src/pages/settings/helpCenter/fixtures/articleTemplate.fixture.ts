import type {
    ArticleTemplate,
    ArticleWithLocalTranslationAndRating,
    HelpCenterArticleItem,
} from 'models/helpCenter/types'
import { ArticleTemplateType } from 'models/helpCenter/types'

export const ArticleTemplatesListFixture: ArticleTemplate[] = [
    {
        key: 'shippingPolicy',
        title: 'Shipping policy',
        html_content: '<h1>Shipping policy</h1>',
        category: 'shippingAndDelivery',
        score: 0,
        excerpt:
            'Our standard shipping time within [country/region] is [# of days] business days. Shipping charges, if applicable, will be calculated and displayed at checkout...',
    },
    {
        key: 'howToReturn',
        title: 'How to return',
        html_content: '<h1>How to return</h1>',
        category: 'shippingAndDelivery',
        score: 0,
        excerpt:
            'Returns must be initiated within [x days] of receiving your order. Items must be unused and in the original packaging...',
    },
    {
        key: 'howToCancelOrder',
        title: 'How to cancel order',
        html_content: '<h1>How to cancel order</h1>',
        category: 'orderManagement',
        score: 0,
        excerpt:
            'You will have the option to cancel your order within your confirmation email. You may also contact our customer service team at [email/phone #]...',
    },
]

export const HelpCenterItemsListFixture: HelpCenterArticleItem[] = [
    {
        key: 'shippingPolicy',
        title: 'Shipping policy',
        content: '<h1>Shipping policy</h1>',
        category: 'shippingAndDelivery',
        type: ArticleTemplateType.Template,
        excerpt:
            'Our standard shipping time within [country/region] is [# of days] business days. Shipping charges, if applicable, will be calculated and displayed at checkout...',
    },
    {
        key: 'howToReturn',
        title: 'How to return',
        content: '<h1>How to return</h1>',
        category: 'shippingAndDelivery',
        type: ArticleTemplateType.Template,
        excerpt:
            'Returns must be initiated within [x days] of receiving your order. Items must be unused and in the original packaging...',
    },
    {
        key: 'howToCancelOrder',
        title: 'How to cancel order',
        content: '<h1>How to cancel order</h1>',
        category: 'orderManagement',
        type: ArticleTemplateType.Template,
        excerpt:
            'You will have the option to cancel your order within your confirmation email. You may also contact our customer service team at [email/phone #]...',
    },
]

export const ArticlesListFixture: ArticleWithLocalTranslationAndRating[] = [
    {
        id: 1,
        unlisted_id: 'c8b6cd65998c4d2fae9131e99ac57d2c',
        created_datetime: '2022-03-07T15:23:19.150Z',
        updated_datetime: '2022-03-07T15:23:19.150Z',
        deleted_datetime: null,
        category_id: null,
        help_center_id: 1,
        available_locales: ['en-US'],
        rating: {
            up: 0,
            down: 0,
        },
        template_key: 'shippingPolicy',
        translation: {
            draft_version_id: null,
            published_version_id: null,
            published_datetime: null,
            publisher_user_id: null,
            commit_message: null,
            version: null,
            locale: 'en-US',
            created_datetime: '2022-03-07T15:23:19.150Z',
            updated_datetime: '2022-03-07T15:24:32.036Z',
            deleted_datetime: null,
            category_id: 5,
            visibility_status: 'PUBLIC',
            customer_visibility: 'PUBLIC',
            article_id: 1,
            article_unlisted_id: 'c8b6cd65998c4d2fae9131e99ac57d2c',
            title: 'Article 1',
            excerpt: '',
            content: '<p>Article for template article 1</p>',
            slug: 'article-1',
            seo_meta: {
                title: null,
                description: null,
            },
            is_current: true,
            rating: {
                up: 0,
                down: 0,
            },
        },
        ingested_resource_id: null,
    },
    {
        id: 2,
        unlisted_id: 'c8b6cd65998c4d2fae9131e99ac57d2c',
        created_datetime: '2022-03-07T15:23:19.150Z',
        updated_datetime: '2022-03-07T15:23:19.150Z',
        deleted_datetime: null,
        category_id: null,
        help_center_id: 1,
        available_locales: ['en-US'],
        rating: {
            up: 0,
            down: 0,
        },
        template_key: 'ai_Generated_1' as any,
        translation: {
            draft_version_id: null,
            published_version_id: null,
            published_datetime: null,
            publisher_user_id: null,
            commit_message: null,
            version: null,
            locale: 'en-US',
            created_datetime: '2022-03-07T15:23:19.150Z',
            updated_datetime: '2022-03-07T15:24:32.036Z',
            deleted_datetime: null,
            category_id: 5,
            visibility_status: 'PUBLIC',
            customer_visibility: 'PUBLIC',
            article_id: 1,
            article_unlisted_id: 'c8b6cd65998c4d2fae9131e99ac57d2c',
            title: 'AI article generated',
            excerpt: '',
            content: '<p>Article for AI article template</p>',
            slug: 'article-1',
            seo_meta: {
                title: null,
                description: null,
            },
            is_current: true,
            rating: {
                up: 0,
                down: 0,
            },
        },
        ingested_resource_id: null,
    },
]

export const ArticleTemplatesGroupedByCategoryFixture: Record<
    string,
    HelpCenterArticleItem[]
> = {
    shippingAndDelivery: [
        {
            key: 'shippingPolicy',
            title: 'Shipping policy',
            content: '<h1>Shipping policy</h1>',
            category: 'shippingAndDelivery',
            type: ArticleTemplateType.Template,
            excerpt:
                'Our standard shipping time within [country/region] is [# of days] business days. Shipping charges, if applicable, will be calculated and displayed at checkout...',
        },
        {
            key: 'howToReturn',
            title: 'How to return',
            content: '<h1>How to return</h1>',
            category: 'shippingAndDelivery',
            type: ArticleTemplateType.Template,
            excerpt:
                'Returns must be initiated within [x days] of receiving your order. Items must be unused and in the original packaging...',
        },
    ],
    orderManagement: [
        {
            key: 'howToCancelOrder',
            title: 'How to cancel order',
            content: '<h1>How to cancel order</h1>',
            category: 'orderManagement',
            type: ArticleTemplateType.Template,
            excerpt:
                'You will have the option to cancel your order within your confirmation email. You may also contact our customer service team at [email/phone #]...',
        },
    ],
}

export const HelpCenterArticleItemFixture: HelpCenterArticleItem = {
    key: 'howToCancelOrder',
    title: 'How to cancel order',
    content: '<h1>How to cancel order</h1>',
    category: 'orderManagement',
    type: ArticleTemplateType.Template,
    excerpt:
        'You will have the option to cancel your order within your confirmation email. You may also contact our customer service team at [email/phone #]...',
    isSelected: true,
}

export const ArticleTemplatesEmptyListFixture = []

export const ArticleTemplatesGeneric500ErrorFixture = {
    error: {
        msg: 'An error occurred',
    },
    status: 500,
    code: 'INTERNAL_SERVER_ERROR_EXCEPTION',
    message: 'An error occurred',
} as const
