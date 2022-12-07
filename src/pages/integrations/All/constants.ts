import {Category} from 'models/integration/types/app'

export const ORDERED_CATEGORIES: {title: Category; subtitle?: string}[] = [
    {
        title: Category.FEATURED,
        subtitle:
            'Our trusted partners and other cool apps that we decided to feature. ',
    },
    {title: Category.CHAT},
    {title: Category.PHONE},
    {title: Category.SMS},
    {title: Category.SOCIAL},
    {title: Category.ECOMMERCE},
    {title: Category.SUBSCRIPTIONS},
    {title: Category.SHIPPING},
    {title: Category.RETURNS},
    {title: Category.LOYALTY},
    {title: Category.REVIEWS},
    {title: Category.MARKETING},
    {title: Category.ANALYTICS},
    {title: Category.DATA},
    {title: Category.QUALITY},
]

export const MAX_CARDS_DISPLAYED = 5
