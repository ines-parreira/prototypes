import { logEvent, SegmentEvent } from '@repo/logging'

import { handleConvertProductRemoved } from '../handleConvertProductRemoved'

vi.mock('@repo/logging', () => ({
    logEvent: vi.fn(),
    SegmentEvent: {
        ConvertBillingProductScheduledDowngrade:
            'ConvertBillingProductScheduledDowngrade',
        ConvertBillingProductRemoved: 'ConvertBillingProductRemoved',
    },
}))

const logEventMock = vi.mocked(logEvent)

describe('handleConvertProductRemoved', () => {
    it('should log the event', () => {
        handleConvertProductRemoved('convert-usd1000', 'acme-shop')

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.ConvertBillingProductRemoved,
            {
                account: 'acme-shop',
                from: 'convert-usd1000',
            },
        )
    })
})
