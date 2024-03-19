import {DISCOUNT_NEW_VISITORS} from './discountNewVisitors'
import {CampaignTemplate, CampaignTemplateSectionType} from './types'
import {CART_ABANDONMENT} from './cartAbandonment'
import {PRODUCT_CARD_SHOWCASE} from './productCards'

// Library Templates
import {PROMOTE_NEWSLETTER_FOR_NEW_VISITORS} from './library/promoteNewsletterForNewVisitors'

export const CAMPAIGN_TEMPLATES: Record<
    CampaignTemplate['slug'],
    CampaignTemplate
> = {
    [DISCOUNT_NEW_VISITORS.slug]: DISCOUNT_NEW_VISITORS,
    [CART_ABANDONMENT.slug]: CART_ABANDONMENT,
    [PRODUCT_CARD_SHOWCASE.slug]: PRODUCT_CARD_SHOWCASE,
}

export const CAMPAIGN_TEMPLATES_LIST = Object.values(CAMPAIGN_TEMPLATES)
export const ONBOARDING_CAMPAIGN_TEMPLATES_LIST = Object.values(
    CAMPAIGN_TEMPLATES
).filter((t) => t.onboarding)

const increaseConversionRate: CampaignTemplateSectionType = {
    title: 'Increase Conversion Rate',
    description:
        'Start with these campaigns to convert your visitors into shoppers.',
    templates: [
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
    ],
}

const increatseAvarageOrderValue: CampaignTemplateSectionType = {
    title: 'Increase Average Order Value',
    description:
        'Offer incentives and recommendations to your visitors depending on their cart content and value.',
    templates: [
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
    ],
}

const highlightProducts: CampaignTemplateSectionType = {
    title: 'Highlight products',
    description:
        'Make sure your visitors are aware of your best offers for them.',
    templates: [
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
    ],
}

const helpAndEducate: CampaignTemplateSectionType = {
    title: 'Help & Educate',
    description:
        'Offer incentives and recommendations to your visitors depending on their cart content and value.',
    templates: [
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
    ],
}

export const CAMPAIGN_SECTIONS: CampaignTemplateSectionType[] = [
    increaseConversionRate,
    increatseAvarageOrderValue,
    highlightProducts,
    helpAndEducate,
]
