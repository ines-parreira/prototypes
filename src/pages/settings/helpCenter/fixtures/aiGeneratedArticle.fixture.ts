import {AIArticle} from 'models/helpCenter/types'

export const AIArticlesListFixture: AIArticle[] = [
    {
        key: 'ai_Generated_1',
        title: 'AI Generated Article 1',
        html_content: '<h1>AI Generated Article 1</h1>',
        score: 0,
        category: 'General',
        excerpt:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...',
    },
    {
        key: 'ai_Generated_2',
        title: 'AI Generated Article 2',
        html_content: '<h1>AI Generated Article 2</h1>',
        score: 0,
        excerpt:
            'Returns must be initiated within [x days] of receiving your order. Items must be unused and in the original packaging...',
    },
    {
        key: 'ai_Generated_3',
        title: 'How to cancel order',
        html_content: '<h1>How to cancel order</h1>',
        score: 0,
        category: 'Ordering',
        excerpt:
            'You will have the option to cancel your order within your confirmation email. You may also contact our customer service team at [email/phone #]...',
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
