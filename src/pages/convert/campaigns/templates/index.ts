import {DISCOUNT_NEW_VISITORS} from './discountNewVisitors'
import {CampaignTemplate, CampaignTemplateSectionType} from './types'
import {CART_ABANDONMENT} from './cartAbandonment'
import {PRODUCT_CARD_SHOWCASE} from './productCards'

// Library Templates
import {PROMOTE_NEWSLETTER_FOR_NEW_VISITORS} from './library/promoteNewsletterForNewVisitors'
import {CONNECT_CUSTOMER_ON_CART_WITH_TEAM} from './library/connectCustomerOnCartWithTeam'
import {PROMOTE_SALE_COLLECTION} from './library/promoteSaleCollectionForReturning'

import {DISCOUNT_HIGH_VALUE_CARTS} from './library/discountForVisitorswithHighValueCart'
import {FREE_SHIPPING_BENEFITS} from './library/freeShippingBenefits'
import {SUGGEST_BUNDLES_WHEN_SINGLE_PRODUCT_IN_CARD} from './library/suggestBundlesWhenSingleItemInCart'

import {PROMOTE_NEW_PRODUCT_ON_COLLECTION_PAGE} from './library/promoteNewProductReleaseOnCollectionPage'
import {SCHEDULE_LIMITED_TIME_OFFER} from './library/scheduledLimitedTimeOffer'
import {SUGGEST_SIMILAR_PRODUCTS_FOR_SOLD_OUT} from './library/suggestSimilarProduct'

import {OFFER_CHAT_WITH_TEAM_TO_FIND_BEST_FIT} from './library/offerChatWithTeamToFindBestFit'
import {PROMOTE_QUIZZES_TO_HELP_VISIOTOR} from './library/promoteQuizzesToChooseProduct'
import {LINK_VALUABLE_RESOURCES_TO_HELP_VISITORS} from './library/linkValuableResourcesToHelpVisitors'

export const CAMPAIGN_TEMPLATES: Record<
    CampaignTemplate['slug'],
    CampaignTemplate
> = {
    [DISCOUNT_NEW_VISITORS.slug]: DISCOUNT_NEW_VISITORS,
    [CART_ABANDONMENT.slug]: CART_ABANDONMENT,
    [PRODUCT_CARD_SHOWCASE.slug]: PRODUCT_CARD_SHOWCASE,
    [PROMOTE_NEWSLETTER_FOR_NEW_VISITORS.slug]:
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
    [CONNECT_CUSTOMER_ON_CART_WITH_TEAM.slug]:
        CONNECT_CUSTOMER_ON_CART_WITH_TEAM,
    [PROMOTE_SALE_COLLECTION.slug]: PROMOTE_SALE_COLLECTION,
    [DISCOUNT_HIGH_VALUE_CARTS.slug]: DISCOUNT_HIGH_VALUE_CARTS,
    [FREE_SHIPPING_BENEFITS.slug]: FREE_SHIPPING_BENEFITS,
    [SUGGEST_BUNDLES_WHEN_SINGLE_PRODUCT_IN_CARD.slug]:
        SUGGEST_BUNDLES_WHEN_SINGLE_PRODUCT_IN_CARD,
    [PROMOTE_NEW_PRODUCT_ON_COLLECTION_PAGE.slug]:
        PROMOTE_NEW_PRODUCT_ON_COLLECTION_PAGE,
    [SCHEDULE_LIMITED_TIME_OFFER.slug]: SCHEDULE_LIMITED_TIME_OFFER,
    [SUGGEST_SIMILAR_PRODUCTS_FOR_SOLD_OUT.slug]:
        SUGGEST_SIMILAR_PRODUCTS_FOR_SOLD_OUT,
    [OFFER_CHAT_WITH_TEAM_TO_FIND_BEST_FIT.slug]:
        OFFER_CHAT_WITH_TEAM_TO_FIND_BEST_FIT,
    [PROMOTE_QUIZZES_TO_HELP_VISIOTOR.slug]: PROMOTE_QUIZZES_TO_HELP_VISIOTOR,
    [LINK_VALUABLE_RESOURCES_TO_HELP_VISITORS.slug]:
        LINK_VALUABLE_RESOURCES_TO_HELP_VISITORS,
}

export const CAMPAIGN_TEMPLATES_LIST = Object.values(CAMPAIGN_TEMPLATES)
export const ONBOARDING_CAMPAIGN_TEMPLATES_LIST = Object.values(
    CAMPAIGN_TEMPLATES
).filter((t) => t.onboarding)
export const CAMPANY_LIBRARY_TEMPLATES_LIST = Object.values(
    CAMPAIGN_TEMPLATES
).filter((t) => !t.onboarding)

const increaseConversionRate: CampaignTemplateSectionType = {
    title: 'Increase Conversion Rate',
    description:
        'Start with these campaigns to convert your visitors into shoppers.',
    templates: [
        PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
        CONNECT_CUSTOMER_ON_CART_WITH_TEAM,
        PROMOTE_SALE_COLLECTION,
    ],
}

const increatseAvarageOrderValue: CampaignTemplateSectionType = {
    title: 'Increase Average Order Value',
    description:
        'Offer incentives and recommendations to your visitors depending on their cart content and value.',
    templates: [
        DISCOUNT_HIGH_VALUE_CARTS,
        FREE_SHIPPING_BENEFITS,
        SUGGEST_BUNDLES_WHEN_SINGLE_PRODUCT_IN_CARD,
    ],
}

const highlightProducts: CampaignTemplateSectionType = {
    title: 'Highlight products',
    description:
        'Make sure your visitors are aware of your best offers for them.',
    templates: [
        PROMOTE_NEW_PRODUCT_ON_COLLECTION_PAGE,
        SCHEDULE_LIMITED_TIME_OFFER,
        SUGGEST_SIMILAR_PRODUCTS_FOR_SOLD_OUT,
    ],
}

const helpAndEducate: CampaignTemplateSectionType = {
    title: 'Help & Educate',
    description:
        'Offer incentives and recommendations to your visitors depending on their cart content and value.',
    templates: [
        OFFER_CHAT_WITH_TEAM_TO_FIND_BEST_FIT,
        PROMOTE_QUIZZES_TO_HELP_VISIOTOR,
        LINK_VALUABLE_RESOURCES_TO_HELP_VISITORS,
    ],
}

export const CAMPAIGN_SECTIONS: CampaignTemplateSectionType[] = [
    increaseConversionRate,
    increatseAvarageOrderValue,
    highlightProducts,
    helpAndEducate,
]
