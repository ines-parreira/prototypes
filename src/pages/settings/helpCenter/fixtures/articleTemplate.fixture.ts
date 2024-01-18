import {ArticleTemplate} from 'models/helpCenter/types'
import {ArticleTemplateKeys} from '../types/articleTemplates'

export const ArticleTemplatesListFixture: ArticleTemplate[] = [
    {
        key: ArticleTemplateKeys.ShippingPolicy,
        title: 'Shipping policy',
        html_content: '<h1>Shipping policy</h1>',
        category: 'shippingAndDelivery',
        score: 0,
    },
    {
        key: ArticleTemplateKeys.HowToReturn,
        title: 'How to return',
        html_content: '<h1>How to return</h1>',
        category: 'shippingAndDelivery',
        score: 0,
    },
    {
        key: ArticleTemplateKeys.HowToCancelOrder,
        title: 'How to cancel order',
        html_content: '<h1>How to cancel order</h1>',
        category: 'orderManagement',
        score: 0,
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
