import {
    CONTAINS_DISCOUNT_CODES,
    CONTAINS_PRODUCT_CARDS,
    TRIGGERED_ON_EXIT_INTENT,
    TRIGGERED_OUTSIDE_BUSINESS_HOURS,
} from '../constants/filters'

import {Campaign} from '../types/Campaign'
import {CampaignTriggerType} from '../types/enums/CampaignTriggerType.enum'
import {CampaignTriggerBusinessHoursValuesEnum} from '../types/enums/CampaignTriggerBusinessHoursValues.enum'

export function filterWithAttachments(campaigns: Campaign[]): Campaign[] {
    return campaigns.filter(
        (campaign) => campaign.attachments && campaign.attachments.length > 0
    )
}

export function filterWithDiscountCodes(campaigns: Campaign[]): Campaign[] {
    return campaigns.filter((campaign) => {
        return campaign.message_html?.includes('data-discount-code')
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

const QUICK_FILTERS_FN = {
    [CONTAINS_PRODUCT_CARDS.id]: filterWithAttachments,
    [CONTAINS_DISCOUNT_CODES.id]: filterWithDiscountCodes,
    [TRIGGERED_ON_EXIT_INTENT.id]: filterWithExitIntent,
    [TRIGGERED_OUTSIDE_BUSINESS_HOURS.id]: filterWithOutsideBusinessHours,
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
