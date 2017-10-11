import {fromJS} from 'immutable'

export const GRAVATAR_URL_TEMPLATE = 'https://www.gravatar.com/avatar/{emailMd5}?d=mm&s=50'

export const CAMPAIGNS_TRIGGER_KEYS = fromJS([
    {
        label: 'Current URL',
        name: 'current_url',
        operators: {
            eq: {
                label: 'is'
            },
            neq: {
                label: 'is not'
            },
            contains: {
                label: 'contains'
            },
            notContains: {
                label: 'does not contain'
            },
            startsWith: {
                label: 'starts with'
            },
            endsWith: {
                label: 'ends with'
            }
        },
        value: {
            input: 'text',
            default: ''
        },
    },
    {
        label: 'Time spent on page',
        name: 'time_spent_on_page',
        operators: {
            gt: {
                label: 'is greater than'
            }
        },
        value: {
            input: 'number',
            default: 0
        }
    }
])
