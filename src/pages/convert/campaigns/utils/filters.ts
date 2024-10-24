import {
    AB_GROUP_TESTS,
    CONTAINS_DISCOUNT_CODES,
    CONTAINS_PRODUCT_CARDS,
    TRIGGERED_ON_EXIT_INTENT,
    TRIGGERED_OUTSIDE_BUSINESS_HOURS,
} from '../constants/filters'

import {Campaign} from '../types/Campaign'
import {
    campaignAttachmentIsDiscountOffer,
    campaignAttachmentIsProduct,
    campaignAttachmentIsProductRecommendation,
} from '../types/CampaignAttachment'
import {CampaignTriggerBusinessHoursValuesEnum} from '../types/enums/CampaignTriggerBusinessHoursValues.enum'
import {CampaignTriggerType} from '../types/enums/CampaignTriggerType.enum'

export function filterWithProductCards(campaigns: Campaign[]): Campaign[] {
    return campaigns.filter(
        (campaign) =>
            campaign.attachments &&
            campaign.attachments.some(
                (attachment) =>
                    !!campaignAttachmentIsProduct(attachment) ||
                    !!campaignAttachmentIsProductRecommendation(attachment)
            )
    )
}

// Discount codes means either the discount code as text, or the discount offer as attachment
export function filterWithDiscountCodes(campaigns: Campaign[]): Campaign[] {
    return campaigns.filter((campaign) => {
        return (
            campaign.message_html?.includes('data-discount-code') ||
            (campaign.attachments &&
                campaign.attachments.some(
                    (attachment) =>
                        !!campaignAttachmentIsDiscountOffer(attachment)
                ))
        )
    })
}

export function filterWithExitIntent(campaigns: Campaign[]): Campaign[] {
    return campaigns.filter((campaign) => {
        return campaign.triggers.some(
            (trigger) => trigger.type === CampaignTriggerType.ExitIntent
        )
    })
}

export function filterWithOutsideBusinessHours(
    campaigns: Campaign[]
): Campaign[] {
    return campaigns.filter((campaign) => {
        return campaign.triggers.some((trigger) => {
            if (trigger.type === CampaignTriggerType.BusinessHours) {
                return (
                    trigger.value ===
                        CampaignTriggerBusinessHoursValuesEnum.Outside ||
                    trigger.value ===
                        CampaignTriggerBusinessHoursValuesEnum.Anytime
                )
            }
            return false
        })
    })
}

export const filterWithABTests = (campaigns: Campaign[]): Campaign[] => {
    return campaigns.filter((campaign) => {
        return !!campaign.ab_group
    })
}

const QUICK_FILTERS_FN = {
    [CONTAINS_PRODUCT_CARDS.id]: filterWithProductCards,
    [CONTAINS_DISCOUNT_CODES.id]: filterWithDiscountCodes,
    [TRIGGERED_ON_EXIT_INTENT.id]: filterWithExitIntent,
    [TRIGGERED_OUTSIDE_BUSINESS_HOURS.id]: filterWithOutsideBusinessHours,
    [AB_GROUP_TESTS.id]: filterWithABTests,
}

export function quickFiltersInvoke(
    campaigns: Campaign[],
    quickFilters: string[]
): Campaign[] {
    return quickFilters.reduce((acc, quickFilter) => {
        const filterFn = QUICK_FILTERS_FN[quickFilter]
        if (filterFn) {
            return filterFn(acc)
        }
        return acc
    }, campaigns)
}
