import {Category} from 'models/integration/types/app'

export const CATEGORY_DATA: {
    [key in Category]: {
        title: string
        subtitle?: string
        skipNav?: boolean
    }
} = {
    [Category.FEATURED]: {
        title: 'Featured',
        skipNav: true,
    },
    [Category.CHAT]: {
        title: 'Chat',
    },
    [Category.PHONE]: {
        title: 'Phone',
    },
    [Category.SMS]: {
        title: 'SMS',
    },
    [Category.SOCIAL]: {
        title: 'Social media',
    },
    [Category.ECOMMERCE]: {
        title: 'Ecommerce',
    },
    [Category.SUBSCRIPTIONS]: {
        title: 'Subscriptions',
    },
    [Category.SHIPPING]: {
        title: 'Shipping & fulfillment',
    },
    [Category.RETURNS]: {
        title: 'Returns & exchanges',
    },
    [Category.LOYALTY]: {
        title: 'Loyalty & retention',
    },
    [Category.REVIEWS]: {
        title: 'Reviews & UGC',
    },
    [Category.MARKETING]: {
        title: 'Marketing',
    },
    [Category.ANALYTICS]: {
        title: 'BI & analytics',
    },
    [Category.DATA]: {
        title: 'Data management',
    },
    [Category.QUALITY]: {
        title: 'Quality assurance',
    },
}

export const ORDERED_CATEGORIES: Category[] = [
    Category.FEATURED,
    Category.CHAT,
    Category.PHONE,
    Category.SMS,
    Category.SOCIAL,
    Category.ECOMMERCE,
    Category.SUBSCRIPTIONS,
    Category.SHIPPING,
    Category.RETURNS,
    Category.LOYALTY,
    Category.REVIEWS,
    Category.MARKETING,
    Category.ANALYTICS,
    Category.DATA,
    Category.QUALITY,
]

export const MAX_CARDS_DISPLAYED = 5

export const CATEGORY_URL_PARAM = 'category'

export const SEARCH_URL_PARAM = 'search'
