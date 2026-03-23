import { screen } from '@testing-library/react'

import { render } from '../../../../../../tests/render.utils'
import { SHIPPING_FIELD_DEFINITIONS } from '../../fieldDefinitions/orderShippingFields'
import type { OrderDetailsData } from '../../types'
import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'
import { OrderShipmentSection } from '../sections/OrderShipmentSection'

vi.mock('../../widget/useOrderFieldPreferences', () => ({
    useOrderFieldPreferences: vi.fn(),
}))

vi.mock('@repo/preferences', () => ({
    useUserDateTimePreferences: () => ({
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '24h',
    }),
}))

const mockUseOrderFieldPreferences = vi.mocked(useOrderFieldPreferences)

function makeOrder(
    overrides: Partial<OrderDetailsData> = {},
): OrderDetailsData {
    return {
        id: 1,
        ...overrides,
    }
}

const allShippingFieldsVisible = Object.keys(SHIPPING_FIELD_DEFINITIONS).map(
    (id) => ({ id, visible: true }),
)

describe('OrderShipmentSection', () => {
    beforeEach(() => {
        mockUseOrderFieldPreferences.mockReturnValue({
            preferences: {
                sections: {
                    shipping: {
                        fields: allShippingFieldsVisible,
                        sectionVisible: true,
                    },
                },
            },
            getVisibleFields: () => Object.values(SHIPPING_FIELD_DEFINITIONS),
            savePreferences: vi.fn(),
            isLoading: false,
        })
    })

    describe('empty state', () => {
        it('renders the section when fulfillments is undefined', () => {
            render(<OrderShipmentSection order={makeOrder()} />)

            expect(screen.getByText('Shipping')).toBeInTheDocument()
        })

        it('renders the section when fulfillments is null', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({ fulfillments: null })}
                />,
            )

            expect(screen.getByText('Shipping')).toBeInTheDocument()
        })

        it('renders the section when fulfillments is an empty array', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({ fulfillments: [] })}
                />,
            )

            expect(screen.getByText('Shipping')).toBeInTheDocument()
        })

        it('shows "-" for tracking URL when fulfillments is null', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({ fulfillments: null })}
                />,
            )

            expect(screen.getByText('Tracking URL')).toBeInTheDocument()
            expect(screen.getAllByText('-')[0]).toBeInTheDocument()
            expect(screen.queryByRole('link')).not.toBeInTheDocument()
        })

        it('shows "-" for tracking number when fulfillments is null', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({ fulfillments: null })}
                />,
            )

            expect(screen.getByText('Tracking number')).toBeInTheDocument()
            expect(screen.getAllByText('-')[1]).toBeInTheDocument()
        })
    })

    describe('with tracking data', () => {
        it('renders tracking URL as a link with correct href, target, and rel', () => {
            const trackingUrl =
                'https://track.amazon.com/tracking/TBA326340941474'

            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [{ tracking_url: trackingUrl }],
                    })}
                />,
            )

            expect(screen.getByText('Tracking URL')).toBeInTheDocument()

            const link = screen.getByRole('link', { name: trackingUrl })
            expect(link).toHaveAttribute('href', trackingUrl)
            expect(link).toHaveAttribute('target', '_blank')
            expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        })

        it('renders tracking number as text', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [{ tracking_number: 'TBA326340941474' }],
                    })}
                />,
            )

            expect(screen.getByText('Tracking number')).toBeInTheDocument()
            expect(screen.getByText('TBA326340941474')).toBeInTheDocument()
        })

        it('renders both tracking URL and tracking number', () => {
            const trackingUrl =
                'https://track.amazon.com/tracking/TBA326340941474'
            const trackingNumber = 'TBA326340941474'

            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [
                            {
                                tracking_url: trackingUrl,
                                tracking_number: trackingNumber,
                            },
                        ],
                    })}
                />,
            )

            expect(
                screen.getByRole('link', { name: trackingUrl }),
            ).toBeInTheDocument()
            expect(screen.getByText(trackingNumber)).toBeInTheDocument()
        })

        it('shows "-" for tracking URL when only tracking_number is provided', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [{ tracking_number: 'TBA326340941474' }],
                    })}
                />,
            )

            expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1)
            expect(screen.queryByRole('link')).not.toBeInTheDocument()
        })

        it('shows "-" for tracking number when only tracking_url is provided', () => {
            const trackingUrl =
                'https://track.amazon.com/tracking/TBA326340941474'

            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [{ tracking_url: trackingUrl }],
                    })}
                />,
            )

            expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1)
        })
    })

    describe('field preferences', () => {
        it('renders nothing when sectionVisible is false', () => {
            mockUseOrderFieldPreferences.mockReturnValue({
                preferences: {
                    sections: {
                        shipping: {
                            fields: allShippingFieldsVisible,
                            sectionVisible: false,
                        },
                    },
                },
                getVisibleFields: () =>
                    Object.values(SHIPPING_FIELD_DEFINITIONS),
                savePreferences: vi.fn(),
                isLoading: false,
            })

            const { container } = render(
                <OrderShipmentSection order={makeOrder()} />,
            )
            expect(container).toBeEmptyDOMElement()
        })

        it('renders nothing when no visible fields', () => {
            mockUseOrderFieldPreferences.mockReturnValue({
                preferences: {
                    sections: {
                        shipping: {
                            fields: [],
                            sectionVisible: true,
                        },
                    },
                },
                getVisibleFields: () => [],
                savePreferences: vi.fn(),
                isLoading: false,
            })

            const { container } = render(
                <OrderShipmentSection order={makeOrder()} />,
            )
            expect(container).toBeEmptyDOMElement()
        })
    })
})
