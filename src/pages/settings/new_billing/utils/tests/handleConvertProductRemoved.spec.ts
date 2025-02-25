import { logEvent, SegmentEvent } from 'common/segment'
import { assumeMock } from 'utils/testing'

import { handleConvertProductRemoved } from '../handleConvertProductRemoved'

jest.mock('common/segment')
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
