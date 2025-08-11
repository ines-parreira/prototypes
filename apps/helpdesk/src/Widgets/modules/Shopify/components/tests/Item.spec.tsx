import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { itemCustomization } from '../Item'
import { OrderContext } from '../Order'

// Mock Badge component
jest.mock('@gorgias/axiom', () => ({
    __esModule: true,
    ColorType: {
        Warning: 'warning',
    },
    Badge: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="badge">{children}</div>
    ),
}))

const { BeforeContent, Wrapper } = itemCustomization

describe('Shopify widget Item component', () => {
    describe('<BeforeContent />', () => {
        it('should not render when no refunded quantity', () => {
            const mockItem = fromJS({ id: 1 })
            const mockOrder = fromJS({ refunds: [] })

            const mockOrderContext = {
                order: mockOrder,
                orderId: null,
                isOrderCancelled: null,
                isOrderRefunded: null,
                isOrderFulfilled: null,
                isOrderPartiallyFulfilled: null,
                isOldOrder: null,
                integrationId: null,
                integration: fromJS({}),
            }

            const { queryByTestId } = render(
                <OrderContext.Provider value={mockOrderContext}>
                    <Wrapper source={mockItem}>
                        <BeforeContent />
                    </Wrapper>
                </OrderContext.Provider>,
            )

            expect(queryByTestId('badge')).not.toBeInTheDocument()
        })

        it('should render badge with singular text for 1 refunded item', () => {
            const mockItem = fromJS({ id: 1 })
            const mockOrder = fromJS({
                refunds: [
                    {
                        refund_line_items: [
                            {
                                line_item_id: 1,
                                quantity: 1,
                            },
                        ],
                    },
                ],
            })

            const mockOrderContext = {
                order: mockOrder,
                orderId: null,
                isOrderCancelled: null,
                isOrderRefunded: null,
                isOrderFulfilled: null,
                isOrderPartiallyFulfilled: null,
                isOldOrder: null,
                integrationId: null,
                integration: fromJS({}),
            }

            const { getByTestId } = render(
                <OrderContext.Provider value={mockOrderContext}>
                    <Wrapper source={mockItem}>
                        <BeforeContent />
                    </Wrapper>
                </OrderContext.Provider>,
            )

            expect(getByTestId('badge')).toHaveTextContent('1 item')
        })

        it('should render badge with plural text for multiple refunded items', () => {
            const mockItem = fromJS({ id: 1 })
            const mockOrder = fromJS({
                refunds: [
                    {
                        refund_line_items: [
                            {
                                line_item_id: 1,
                                quantity: 2,
                            },
                        ],
                    },
                ],
            })

            const mockOrderContext = {
                order: mockOrder,
                orderId: null,
                isOrderCancelled: null,
                isOrderRefunded: null,
                isOrderFulfilled: null,
                isOrderPartiallyFulfilled: null,
                isOldOrder: null,
                integrationId: null,
                integration: fromJS({}),
            }

            const { getByTestId } = render(
                <OrderContext.Provider value={mockOrderContext}>
                    <Wrapper source={mockItem}>
                        <BeforeContent />
                    </Wrapper>
                </OrderContext.Provider>,
            )

            expect(getByTestId('badge')).toHaveTextContent('2 items')
        })

        it('should sum quantities across multiple refunds', () => {
            const mockItem = fromJS({ id: 1 })
            const mockOrder = fromJS({
                refunds: [
                    {
                        refund_line_items: [
                            {
                                line_item_id: 1,
                                quantity: 2,
                            },
                        ],
                    },
                    {
                        refund_line_items: [
                            {
                                line_item_id: 1,
                                quantity: 3,
                            },
                        ],
                    },
                ],
            })

            const mockOrderContext = {
                order: mockOrder,
                orderId: null,
                isOrderCancelled: null,
                isOrderRefunded: null,
                isOrderFulfilled: null,
                isOrderPartiallyFulfilled: null,
                isOldOrder: null,
                integrationId: null,
                integration: fromJS({}),
            }

            const { getByTestId } = render(
                <OrderContext.Provider value={mockOrderContext}>
                    <Wrapper source={mockItem}>
                        <BeforeContent />
                    </Wrapper>
                </OrderContext.Provider>,
            )

            expect(getByTestId('badge')).toHaveTextContent('5 items')
        })
    })
})
