import { logEvent, SegmentEvent } from 'common/segment'

import { TrialEventType, TrialType } from '../types/ShoppingAssistant'

export const logTrialBannerEvent = (
    eventType: TrialEventType,
    trialType: TrialType = TrialType.ShoppingAssistant,
) => {
    const validEvents = [
        TrialEventType.StartTrial,
        TrialEventType.Demo,
        TrialEventType.Learn,
        TrialEventType.NotifyAdmin,
    ]

    if (validEvents.includes(eventType)) {
        logEvent(SegmentEvent.TrialBannerOverviewCTAClicked, {
            CTA: eventType,
            trialType,
        })
    } else {
        console.warn(`Unsupported event type: ${eventType}`)
    }
}

export const logInTrialEvent = (
    eventType: TrialEventType,
    trialType: TrialType = TrialType.ShoppingAssistant,
) => {
    const validEvents = [
        TrialEventType.UpgradePlan,
        TrialEventType.ManageTrial,
        TrialEventType.SetUpSalesStrategy,
    ]

    if (validEvents.includes(eventType)) {
        logEvent(SegmentEvent.TrialBannerSettingsClicked, {
            CTA: eventType,
            trialType,
        })
    } else {
        console.warn(`Unsupported event type: ${eventType}`)
    }
}

export const logInTrialEventFromPaywall = (
    eventType: TrialEventType,
    trialType: TrialType = TrialType.ShoppingAssistant,
) => {
    const validEvents = [
        TrialEventType.StartTrial,
        TrialEventType.Demo,
        TrialEventType.Learn,
        TrialEventType.NotifyAdmin,
        TrialEventType.UpgradePlan,
        TrialEventType.ManageTrial,
        TrialEventType.SetUpSalesStrategy,
    ]

    if (validEvents.includes(eventType)) {
        logEvent(SegmentEvent.TrialLinkPaywallClicked, {
            CTA: eventType,
            trialType,
        })
    } else {
        console.warn(`Unsupported event type: ${eventType}`)
    }
}
