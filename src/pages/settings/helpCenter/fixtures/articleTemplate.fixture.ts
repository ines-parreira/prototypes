import {ArticleTemplate} from 'models/helpCenter/types'
import {ArticleTemplateKey} from '../types/articleTemplates'

export const ArticleTemplatesListFixture: ArticleTemplate[] = [
    {
        key: ArticleTemplateKey.ShippingPolicy,
        title: 'Shipping policy',
        html_content: '<h1>Shipping policy</h1>',
        category: 'shippingAndDelivery',
        score: 0,
        excerpt:
            'Our standard shipping time within [country/region] is [# of days] business days. Shipping charges, if applicable, will be calculated and displayed at checkout...',
    },
    {
        key: ArticleTemplateKey.HowToReturn,
        title: 'How to return',
        html_content: '<h1>How to return</h1>',
        category: 'shippingAndDelivery',
        score: 0,
        excerpt:
            'Returns must be initiated within [x days] of receiving your order. Items must be unused and in the original packaging...',
    },
    {
        key: ArticleTemplateKey.HowToCancelOrder,
        title: 'How to cancel order',
        html_content: '<h1>How to cancel order</h1>',
        category: 'orderManagement',
        score: 0,
        excerpt:
            'You will have the option to cancel your order within your confirmation email. You may also contact our customer service team at [email/phone #]...',
    },
]

export const ArticleTemplatesEmptyListFixture = []

export const ArticleTemplatesGeneric500ErrorFixture = {
    error: {
        msg: 'An error occurred',
    },
    status: 500,
    code: 'INTERNAL_SERVER_ERROR_EXCEPTION',
    message: 'An error occurred',
} as const
