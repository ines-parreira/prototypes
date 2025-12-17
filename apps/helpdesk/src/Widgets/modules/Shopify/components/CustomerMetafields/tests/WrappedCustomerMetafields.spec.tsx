import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import WrappedCustomerMetafields from '../WrappedCustomerMetafields'

jest.mock('@repo/feature-flags')
const mockUseFlag = assumeMock(useFlag)

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        ShopifyMetafieldsOpenCustomer: 'shopify/metafields/customer/open',
    },
}))

const server = setupServer()

const mockShopifyCustomerMetafieldsHandler = http.get(
    '/integrations/shopify/:integrationId/customer/:customerId/metafields',
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
    server.use(mockShopifyCustomerMetafieldsHandler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('<WrappedCustomerMetafields />', () => {
    const defaultProps = {
        integrationId: 123,
        customerId: 456,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when ShowShopifyCustomerMetafields feature flag is disabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(false)
        })

        it('should return null and not render anything', () => {
            const { container } = renderWithQueryClientProvider(
                <WrappedCustomerMetafields {...defaultProps} />,
            )

            expect(container.firstChild).toBeNull()
        })
    })

    describe('when ShowShopifyCustomerMetafields feature flag is enabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('should render CustomerMetafields', () => {
            renderWithQueryClientProvider(
                <WrappedCustomerMetafields {...defaultProps} />,
            )

            expect(screen.getByText('Customer Metafields')).toBeInTheDocument()
        })

        it('should log ShopifyMetafieldsOpenCustomer event when metafields container is expanded', () => {
            renderWithQueryClientProvider(
                <WrappedCustomerMetafields {...defaultProps} />,
            )

            expect(logEvent).not.toHaveBeenCalled()

            const expandButton = screen.getByTitle('Unfold this card')
            fireEvent.click(expandButton)

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.ShopifyMetafieldsOpenCustomer,
            )
            expect(logEvent).toHaveBeenCalledTimes(1)
        })
    })
})
