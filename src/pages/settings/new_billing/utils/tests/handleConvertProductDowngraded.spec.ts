import {logEvent, SegmentEvent} from 'common/segment'
import {assumeMock} from 'utils/testing'
import {convertPrice1, convertPrice2} from 'fixtures/productPrices'
import {handleConvertProductDowngraded} from '../handleConvertProductDowngraded'

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('handleConvertProductDowngraded', () => {
    it('should log the event', () => {
        handleConvertProductDowngraded(
            convertPrice2,
            convertPrice1,
            'acme-shop'
        )

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.ConvertBillingProductScheduledDowngrade,
            {
                account: 'acme-shop',
                from: convertPrice2.internal_id,
                to: convertPrice1.internal_id,
            }
        )
    })
})
