import { fireEvent, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { logEvent, SegmentEvent } from 'common/segment'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import WrappedOrderMetafields from './OrderMetafields'

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        ShopifyMetafieldsOpenOrder: 'SHOPIFY_METAFIELDS_OPEN_ORDER',
    },
}))

const server = setupServer()

const mockShopifyOrderMetafieldsHandler = http.get(
    '/integrations/shopify/:integrationId/order/:orderId/metafields',
    () => {
        return HttpResponse.json({
            data: {
                data: [],
            },
        })
    },
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockShopifyOrderMetafieldsHandler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('WrappedOrderMetafields', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should log ShopifyMetafieldsOpenOrder event when metafields container is expanded', () => {
        renderWithQueryClientProvider(
            <WrappedOrderMetafields integrationId={123} orderId={456} />,
        )

        expect(logEvent).not.toHaveBeenCalled()

        const expandButton = screen.getByTitle('Unfold this card')
        fireEvent.click(expandButton)

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.ShopifyMetafieldsOpenOrder,
        )
        expect(logEvent).toHaveBeenCalledTimes(1)
    })
})
