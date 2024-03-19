import {DISCOUNT_NEW_VISITORS} from './discountNewVisitors'
import {CampaignTemplate} from './types'
import {CART_ABANDONMENT} from './cartAbandonment'
import {PRODUCT_CARD_SHOWCASE} from './productCards'

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
