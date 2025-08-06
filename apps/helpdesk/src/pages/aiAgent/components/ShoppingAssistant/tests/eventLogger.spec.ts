import { logEvent, SegmentEvent } from 'common/segment'

import { ShoppingAssistantEventType } from '../types/ShoppingAssistant'
import { logShoppingAssistantEvent } from '../utils/eventLogger'

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        TrialBannerOverviewCTAClicked: 'TrialBannerOverviewCTAClicked',
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
