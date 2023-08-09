import {
    CONTAINS_DISCOUNT_CODES,
    CONTAINS_PRODUCT_CARDS,
    TRIGGERED_ON_EXIT_INTENT,
    TRIGGERED_OUTSIDE_BUSINESS_HOURS,
} from '../constants/filters'

import {ChatCampaign} from '../types/Campaign'
import {CampaignTriggerKey} from '../types/enums/CampaignTriggerKey.enum'
import {BusinessHoursOperators} from '../types/enums/BusinessHoursOperators.enum'

export function filterWithAttachments(
    campaigns: ChatCampaign[]
): ChatCampaign[] {
    return campaigns.filter(
        (campaign) => campaign.attachments && campaign.attachments.length > 0
    )
}

export function filterWithDiscountCodes(
    campaigns: ChatCampaign[]
): ChatCampaign[] {
    return campaigns.filter((campaign) => {
        return campaign.message.html.includes('data-discount-code')
    })
}

export function filterWithExitIntent(
    campaigns: ChatCampaign[]
): ChatCampaign[] {
    return campaigns.filter((campaign) => {
        return campaign.triggers.some(
            (trigger) => trigger.key === CampaignTriggerKey.ExitIntent
        )
    })
}

export function filterWithOutsideBusinessHours(
    campaigns: ChatCampaign[]
): ChatCampaign[] {
    return campaigns.filter((campaign) => {
        return campaign.triggers.some((trigger) => {
            if (trigger.key === CampaignTriggerKey.BusinessHours) {
                return (
                    trigger.operator === BusinessHoursOperators.OutsideHours ||
                    trigger.operator === BusinessHoursOperators.Anytime
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
    campaigns: ChatCampaign[],
    quickFilters: string[]
): ChatCampaign[] {
    return quickFilters.reduce((acc, quickFilter) => {
        const filterFn = QUICK_FILTERS_FN[quickFilter]
        if (filterFn) {
            return filterFn(acc)
        }
        return acc
    }, campaigns)
}
