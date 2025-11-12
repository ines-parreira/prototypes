import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'

import { handleConvertProductRemoved } from '../handleConvertProductRemoved'

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

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
