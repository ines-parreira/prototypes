import { assumeMock } from '@repo/testing'

import { logEvent, SegmentEvent } from 'common/segment'
import { convertPlan1, convertPlan2 } from 'fixtures/productPrices'

import { handleConvertProductDowngraded } from '../handleConvertProductDowngraded'

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('handleConvertProductDowngraded', () => {
    it('should log the event', () => {
        handleConvertProductDowngraded(convertPlan2, convertPlan1, 'acme-shop')

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.ConvertBillingProductScheduledDowngrade,
            {
                account: 'acme-shop',
                from: convertPlan2.plan_id,
                to: convertPlan1.plan_id,
            },
        )
    })
})
