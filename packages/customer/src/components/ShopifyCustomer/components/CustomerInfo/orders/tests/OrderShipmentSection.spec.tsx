import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { SHIPPING_FIELD_DEFINITIONS } from '../../fieldDefinitions/orderShippingFields'
import type { OrderDetailsData } from '../../types'
import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'
import { OrderShipmentSection } from '../sections/OrderShipmentSection'

vi.mock('@repo/hooks', async (importOriginal) => ({
    ...((await importOriginal()) as Record<string, unknown>),
    useCopyToClipboard: () => [
        {},
        (text: string) => navigator.clipboard.writeText(text),
    ],
}))

vi.mock('../../widget/useOrderFieldPreferences', () => ({
    useOrderFieldPreferences: vi.fn(),
}))

vi.mock('@repo/preferences', () => ({
    useUserDateTimePreferences: () => ({
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '24h',
        timezone: undefined,
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

        it('renders shipping cost with currency symbol', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        currency: 'USD',
                        shipping_lines: [{ price: '10.00' }],
                    })}
                />,
            )

            expect(screen.getByText('$10.00')).toBeInTheDocument()
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

    describe('shipment status tag', () => {
        it('does not render shipment status when fulfillments is null', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({ fulfillments: null })}
                />,
            )

            expect(
                screen.queryByText('Shipment status'),
            ).not.toBeInTheDocument()
        })

        it('does not render shipment status when shipment_status is undefined', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [{ tracking_number: '123' }],
                    })}
                />,
            )

            expect(
                screen.queryByText('Shipment status'),
            ).not.toBeInTheDocument()
        })

        it('does not render shipment status when shipment_status is null', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [
                            {
                                tracking_number: '123',
                                shipment_status: null,
                            },
                        ],
                    })}
                />,
            )

            expect(
                screen.queryByText('Shipment status'),
            ).not.toBeInTheDocument()
        })

        it('renders "Delivered" tag for delivered status', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [{ shipment_status: 'delivered' }],
                    })}
                />,
            )

            expect(screen.getByText('Shipment status')).toBeInTheDocument()
            expect(screen.getByText('Delivered')).toBeInTheDocument()
        })

        it('renders "In transit" tag for in_transit status', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [{ shipment_status: 'in_transit' }],
                    })}
                />,
            )

            expect(screen.getByText('In transit')).toBeInTheDocument()
        })

        it('renders "Failure" tag for failure status', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [{ shipment_status: 'failure' }],
                    })}
                />,
            )

            expect(screen.getByText('Failure')).toBeInTheDocument()
        })

        it('renders shipment status per entry for multiple fulfillments', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [
                            { shipment_status: 'delivered' },
                            { shipment_status: 'in_transit' },
                        ],
                    })}
                />,
            )

            expect(screen.getByText('Delivered')).toBeInTheDocument()
            expect(screen.getByText('In transit')).toBeInTheDocument()
            expect(screen.getAllByText('Shipment status')).toHaveLength(2)
        })
    })

    describe('multiple shipping entries', () => {
        it('renders one entry group when both arrays are empty', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [],
                        shipping_lines: [],
                    })}
                />,
            )

            expect(screen.getAllByText('Tracking URL')).toHaveLength(1)
            expect(screen.getAllByText('Code')).toHaveLength(1)
        })

        it('renders entries equal to fulfillments count when fulfillments > shipping_lines', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [
                            { tracking_number: 'T1' },
                            { tracking_number: 'T2' },
                            { tracking_number: 'T3' },
                        ],
                        shipping_lines: [{ code: 'STANDARD' }],
                    })}
                />,
            )

            expect(screen.getAllByText('Tracking number')).toHaveLength(3)
            expect(screen.getByText('T1')).toBeInTheDocument()
            expect(screen.getByText('T2')).toBeInTheDocument()
            expect(screen.getByText('T3')).toBeInTheDocument()
        })

        it('renders entries equal to shipping_lines count when shipping_lines > fulfillments', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [{ tracking_number: 'T1' }],
                        shipping_lines: [
                            { code: 'STANDARD' },
                            { code: 'EXPRESS' },
                        ],
                    })}
                />,
            )

            expect(screen.getAllByText('Code')).toHaveLength(2)
            expect(screen.getByText('STANDARD')).toBeInTheDocument()
            expect(screen.getByText('EXPRESS')).toBeInTheDocument()
        })

        it('renders entries when shipping_lines is null but fulfillments has items', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [
                            { tracking_number: 'T1' },
                            { tracking_number: 'T2' },
                        ],
                        shipping_lines: null,
                    })}
                />,
            )

            expect(screen.getAllByText('Tracking number')).toHaveLength(2)
            expect(screen.getByText('T1')).toBeInTheDocument()
            expect(screen.getByText('T2')).toBeInTheDocument()
        })

        it('renders entries when fulfillments is null but shipping_lines has items', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: null,
                        shipping_lines: [
                            { code: 'STANDARD' },
                            { code: 'EXPRESS' },
                        ],
                    })}
                />,
            )

            expect(screen.getAllByText('Code')).toHaveLength(2)
            expect(screen.getByText('STANDARD')).toBeInTheDocument()
            expect(screen.getByText('EXPRESS')).toBeInTheDocument()
        })

        it('shows data from the correct index for each entry', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [
                            {
                                tracking_url: 'https://track.example.com/1',
                            },
                            {
                                tracking_url: 'https://track.example.com/2',
                            },
                        ],
                        shipping_lines: [
                            { code: 'STANDARD' },
                            { code: 'EXPRESS' },
                        ],
                    })}
                />,
            )

            const links = screen.getAllByRole('link')
            expect(links).toHaveLength(2)
            expect(links[0]).toHaveAttribute(
                'href',
                'https://track.example.com/1',
            )
            expect(links[1]).toHaveAttribute(
                'href',
                'https://track.example.com/2',
            )
            expect(screen.getByText('STANDARD')).toBeInTheDocument()
            expect(screen.getByText('EXPRESS')).toBeInTheDocument()
        })
    })

    describe('copyable fields', () => {
        it('renders copy buttons for tracking URL, tracking number, and code but not shipping cost', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        currency: 'USD',
                        fulfillments: [
                            {
                                tracking_url: 'https://track.example.com/1',
                                tracking_number: 'TBA1',
                            },
                        ],
                        shipping_lines: [{ code: 'STANDARD', price: '10.00' }],
                    })}
                />,
            )

            expect(
                screen.getByRole('button', { name: /copy tracking url/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /copy tracking number/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /copy code/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /copy shipping cost/i }),
            ).not.toBeInTheDocument()
        })

        it('copies the tracking URL to the clipboard while keeping the anchor link functional', async () => {
            const writeTextSpy = vi
                .spyOn(navigator.clipboard, 'writeText')
                .mockResolvedValue(undefined)
            const trackingUrl = 'https://track.example.com/ABC123'

            const { user } = render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [{ tracking_url: trackingUrl }],
                    })}
                />,
            )

            expect(
                screen.getByRole('link', { name: trackingUrl }),
            ).toHaveAttribute('href', trackingUrl)

            await user.click(
                screen.getByRole('button', { name: /copy tracking url/i }),
            )

            expect(writeTextSpy).toHaveBeenCalledWith(trackingUrl)
        })
    })
})
