import {SegmentEvent, logEvent} from 'common/segment'
import {Source} from 'models/widget/types'
import {assumeMock} from 'utils/testing'

import {getShopifyResourceIds} from '../getShopifyResourceIds'

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        ShopifyContextDataMissing: 'moki',
        ShopifyContextResourceIdMissing: 'mochi',
    },
}))
const logEventMock = assumeMock(logEvent)

describe('getShopifyResourceIds', () => {
    it("should call logEvent if the source isn't a record", () => {
        const source = 'not a record'
        getShopifyResourceIds(source)

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.ShopifyContextDataMissing,
            expect.any(Object)
        )
    })

    it("should call logEvent source's id and customer id are null", () => {
        const source = {}

        getShopifyResourceIds(source)

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.ShopifyContextResourceIdMissing,
            expect.any(Object)
        )
    })

    it("should return the source's id and customer id or null", () => {
        const targetId = 123
        const customerId = 456
        let source: Source = {
            id: targetId,
        }

        expect(getShopifyResourceIds(source)).toEqual({
            target_id: targetId,
            customer_id: null,
        })

        source = {
            customer: {
                id: customerId,
            },
        }

        expect(getShopifyResourceIds(source)).toEqual({
            target_id: null,
            customer_id: customerId,
        })
    })
})
