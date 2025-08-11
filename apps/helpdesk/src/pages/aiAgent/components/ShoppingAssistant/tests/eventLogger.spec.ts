import { logEvent, SegmentEvent } from 'common/segment'

import { ShoppingAssistantEventType } from '../types/ShoppingAssistant'
import {
    logShoppingAssistantEvent,
    logShoppingAssistantInTrialEvent,
} from '../utils/eventLogger'

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        TrialBannerOverviewCTAClicked: 'TrialBannerOverviewCTAClicked',
        TrialBannerSettingsClicked: 'TrialBannerSettingsClicked',
    },
}))

const mockLogEvent = logEvent as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

describe('logShoppingAssistantEvent', () => {
    it('logs StartTrial event correctly', () => {
        logShoppingAssistantEvent(ShoppingAssistantEventType.StartTrial)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialBannerOverviewCTAClicked,
            { CTA: ShoppingAssistantEventType.StartTrial },
        )
    })

    it('logs Demo event correctly', () => {
        logShoppingAssistantEvent(ShoppingAssistantEventType.Demo)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialBannerOverviewCTAClicked,
            { CTA: ShoppingAssistantEventType.Demo },
        )
    })

    it('logs Learn event correctly', () => {
        logShoppingAssistantEvent(ShoppingAssistantEventType.Learn)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialBannerOverviewCTAClicked,
            { CTA: ShoppingAssistantEventType.Learn },
        )
    })

    it('logs NotifyAdmin event correctly', () => {
        logShoppingAssistantEvent(ShoppingAssistantEventType.NotifyAdmin)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialBannerOverviewCTAClicked,
            { CTA: ShoppingAssistantEventType.NotifyAdmin },
        )
    })

    it('handles invalid event types with warning', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

        // @ts-ignore - Testing invalid event type
        logShoppingAssistantEvent('InvalidEventType')

        expect(mockLogEvent).not.toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(
            'Unsupported event type: InvalidEventType',
        )

        consoleSpy.mockRestore()
    })
})

describe('logShoppingAssistantInTrialEvent', () => {
    it('logs UpgradePlan event correctly', () => {
        logShoppingAssistantInTrialEvent(ShoppingAssistantEventType.UpgradePlan)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialBannerSettingsClicked,
            { CTA: ShoppingAssistantEventType.UpgradePlan },
        )
    })

    it('logs ManageTrial event correctly', () => {
        logShoppingAssistantInTrialEvent(ShoppingAssistantEventType.ManageTrial)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialBannerSettingsClicked,
            { CTA: ShoppingAssistantEventType.ManageTrial },
        )
    })

    it('logs SetUpSalesStrategy event correctly', () => {
        logShoppingAssistantInTrialEvent(
            ShoppingAssistantEventType.SetUpSalesStrategy,
        )

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialBannerSettingsClicked,
            { CTA: ShoppingAssistantEventType.SetUpSalesStrategy },
        )
    })

    it('handles invalid event types with warning', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

        // @ts-ignore - Testing invalid event type
        logShoppingAssistantInTrialEvent('InvalidEventType')

        expect(mockLogEvent).not.toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(
            'Unsupported event type: InvalidEventType',
        )

        consoleSpy.mockRestore()
    })
})
