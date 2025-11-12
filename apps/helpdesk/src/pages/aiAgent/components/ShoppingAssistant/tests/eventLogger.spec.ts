import { logEvent, SegmentEvent } from '@repo/logging'

import { TrialEventType, TrialType } from '../types/ShoppingAssistant'
import {
    logInTrialEvent,
    logInTrialEventFromPaywall,
    logTrialBannerEvent,
} from '../utils/eventLogger'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        TrialBannerOverviewCTAClicked: 'TrialBannerOverviewCTAClicked',
        TrialBannerSettingsClicked: 'TrialBannerSettingsClicked',
        TrialLinkPaywallClicked: 'TrialLinkPaywallClicked',
    },
}))

const mockLogEvent = logEvent as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

describe('logTrialBannerEvent', () => {
    it('logs StartTrial event correctly', () => {
        logTrialBannerEvent(TrialEventType.StartTrial)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialBannerOverviewCTAClicked,
            {
                CTA: TrialEventType.StartTrial,
                trialType: TrialType.ShoppingAssistant,
            },
        )
    })

    it('logs Demo event correctly', () => {
        logTrialBannerEvent(TrialEventType.Demo)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialBannerOverviewCTAClicked,
            {
                CTA: TrialEventType.Demo,
                trialType: TrialType.ShoppingAssistant,
            },
        )
    })

    it('logs Learn event correctly', () => {
        logTrialBannerEvent(TrialEventType.Learn)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialBannerOverviewCTAClicked,
            {
                CTA: TrialEventType.Learn,
                trialType: TrialType.ShoppingAssistant,
            },
        )
    })

    it('logs NotifyAdmin event correctly', () => {
        logTrialBannerEvent(TrialEventType.NotifyAdmin)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialBannerOverviewCTAClicked,
            {
                CTA: TrialEventType.NotifyAdmin,
                trialType: TrialType.ShoppingAssistant,
            },
        )
    })

    it('handles invalid event types with warning', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

        // @ts-ignore - Testing invalid event type
        logTrialBannerEvent('InvalidEventType')

        expect(mockLogEvent).not.toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(
            'Unsupported event type: InvalidEventType',
        )

        consoleSpy.mockRestore()
    })
})

describe('logInTrialEvent', () => {
    it('logs UpgradePlan event correctly', () => {
        logInTrialEvent(TrialEventType.UpgradePlan)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialBannerSettingsClicked,
            {
                CTA: TrialEventType.UpgradePlan,
                trialType: TrialType.ShoppingAssistant,
            },
        )
    })

    it('logs ManageTrial event correctly', () => {
        logInTrialEvent(TrialEventType.ManageTrial)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialBannerSettingsClicked,
            {
                CTA: TrialEventType.ManageTrial,
                trialType: TrialType.ShoppingAssistant,
            },
        )
    })

    it('logs SetUpSalesStrategy event correctly', () => {
        logInTrialEvent(TrialEventType.SetUpSalesStrategy)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialBannerSettingsClicked,
            {
                CTA: TrialEventType.SetUpSalesStrategy,
                trialType: TrialType.ShoppingAssistant,
            },
        )
    })

    it('handles invalid event types with warning', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

        // @ts-ignore - Testing invalid event type
        logInTrialEvent('InvalidEventType')

        expect(mockLogEvent).not.toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(
            'Unsupported event type: InvalidEventType',
        )

        consoleSpy.mockRestore()
    })
})

describe('logInTrialEventFromPaywall', () => {
    it('logs StartTrial event correctly', () => {
        logInTrialEventFromPaywall(TrialEventType.StartTrial)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialLinkPaywallClicked,
            {
                CTA: TrialEventType.StartTrial,
                trialType: TrialType.ShoppingAssistant,
            },
        )
    })

    it('logs Demo event correctly', () => {
        logInTrialEventFromPaywall(TrialEventType.Demo)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialLinkPaywallClicked,
            {
                CTA: TrialEventType.Demo,
                trialType: TrialType.ShoppingAssistant,
            },
        )
    })

    it('logs Learn event correctly', () => {
        logInTrialEventFromPaywall(TrialEventType.Learn)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialLinkPaywallClicked,
            {
                CTA: TrialEventType.Learn,
                trialType: TrialType.ShoppingAssistant,
            },
        )
    })

    it('logs NotifyAdmin event correctly', () => {
        logInTrialEventFromPaywall(TrialEventType.NotifyAdmin)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialLinkPaywallClicked,
            {
                CTA: TrialEventType.NotifyAdmin,
                trialType: TrialType.ShoppingAssistant,
            },
        )
    })

    it('logs UpgradePlan event correctly', () => {
        logInTrialEventFromPaywall(TrialEventType.UpgradePlan)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialLinkPaywallClicked,
            {
                CTA: TrialEventType.UpgradePlan,
                trialType: TrialType.ShoppingAssistant,
            },
        )
    })

    it('logs ManageTrial event correctly', () => {
        logInTrialEventFromPaywall(TrialEventType.ManageTrial)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialLinkPaywallClicked,
            {
                CTA: TrialEventType.ManageTrial,
                trialType: TrialType.ShoppingAssistant,
            },
        )
    })

    it('logs SetUpSalesStrategy event correctly', () => {
        logInTrialEventFromPaywall(TrialEventType.SetUpSalesStrategy)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialLinkPaywallClicked,
            {
                CTA: TrialEventType.SetUpSalesStrategy,
                trialType: TrialType.ShoppingAssistant,
            },
        )
    })

    it('handles invalid event types with warning', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

        // @ts-ignore - Testing invalid event type
        logInTrialEventFromPaywall('InvalidEventType')

        expect(mockLogEvent).not.toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(
            'Unsupported event type: InvalidEventType',
        )

        consoleSpy.mockRestore()
    })
})
