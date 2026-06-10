import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { itemCustomization } from '../Item'
import { OrderContext } from '../Order'

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

            render(
                <OrderContext.Provider value={mockOrderContext}>
                    <Wrapper source={mockItem}>
                        <BeforeContent />
                    </Wrapper>
                </OrderContext.Provider>,
            )

            expect(screen.queryByText(/item/)).not.toBeInTheDocument()
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

            render(
                <OrderContext.Provider value={mockOrderContext}>
                    <Wrapper source={mockItem}>
                        <BeforeContent />
                    </Wrapper>
                </OrderContext.Provider>,
            )

            expect(
                screen.getByText('Refunded', { exact: false }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    (_, element) =>
                        element?.childElementCount === 0 &&
                        element?.textContent?.replace(/\s+/g, ' ').trim() ===
                            '1 item',
                ),
            ).toBeInTheDocument()
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

            render(
                <OrderContext.Provider value={mockOrderContext}>
                    <Wrapper source={mockItem}>
                        <BeforeContent />
                    </Wrapper>
                </OrderContext.Provider>,
            )

            expect(
                screen.getByText('Refunded', { exact: false }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    (_, element) =>
                        element?.childElementCount === 0 &&
                        element?.textContent?.replace(/\s+/g, ' ').trim() ===
                            '2 items',
                ),
            ).toBeInTheDocument()
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

            render(
                <OrderContext.Provider value={mockOrderContext}>
                    <Wrapper source={mockItem}>
                        <BeforeContent />
                    </Wrapper>
                </OrderContext.Provider>,
            )

            expect(
                screen.getByText('Refunded', { exact: false }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    (_, element) =>
                        element?.childElementCount === 0 &&
                        element?.textContent?.replace(/\s+/g, ' ').trim() ===
                            '5 items',
                ),
            ).toBeInTheDocument()
        })
    })
})
