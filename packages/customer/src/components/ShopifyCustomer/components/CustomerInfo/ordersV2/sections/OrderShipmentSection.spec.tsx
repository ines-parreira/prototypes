import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { SHIPPING_FIELD_DEFINITIONS } from '../../fieldDefinitions/orderShippingFields'
import type { OrderDetailsData } from '../../types'
import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'
import { OrderShipmentSection } from './OrderShipmentSection'

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
    return { id: 1, ...overrides }
}

const allShippingFieldsVisible = Object.keys(SHIPPING_FIELD_DEFINITIONS).map(
    (id) => ({ id, visible: true }),
)

describe('OrderShipmentSection (V2)', () => {
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
        it('renders the section heading when fulfillments is undefined', () => {
            render(<OrderShipmentSection order={makeOrder()} />)

            expect(screen.getByText('Shipping')).toBeInTheDocument()
        })

        it('shows "-" for tracking URL when fulfillments is null', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({ fulfillments: null })}
                />,
            )

            expect(screen.getByText('Tracking URL')).toBeInTheDocument()
            expect(screen.queryByRole('link')).not.toBeInTheDocument()
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
                        shipping: { fields: [], sectionVisible: true },
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

    describe('tracking data', () => {
        it('renders tracking URL as a link with correct attributes', () => {
            const trackingUrl = 'https://track.example.com/TBA123'

            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [{ tracking_url: trackingUrl }],
                    })}
                />,
            )

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

            expect(screen.getByText('TBA326340941474')).toBeInTheDocument()
        })

        it('copies tracking URL to clipboard when copy button is clicked', async () => {
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

            await user.click(
                screen.getByRole('button', { name: /copy tracking url/i }),
            )

            expect(writeTextSpy).toHaveBeenCalledWith(trackingUrl)
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

        it('renders "Delivered" tag for delivered status', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [{ shipment_status: 'delivered' }],
                    })}
                />,
            )

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
        it('renders entries equal to fulfillments count when fulfillments > shipping_lines', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [
                            { tracking_number: 'T1' },
                            { tracking_number: 'T2' },
                        ],
                        shipping_lines: [{ code: 'STANDARD' }],
                    })}
                />,
            )

            expect(screen.getAllByText('Tracking number')).toHaveLength(2)
            expect(screen.getByText('T1')).toBeInTheDocument()
            expect(screen.getByText('T2')).toBeInTheDocument()
        })

        it('shows correct URLs per entry index', () => {
            render(
                <OrderShipmentSection
                    order={makeOrder({
                        fulfillments: [
                            { tracking_url: 'https://track.example.com/1' },
                            { tracking_url: 'https://track.example.com/2' },
                        ],
                        shipping_lines: [
                            { code: 'STANDARD' },
                            { code: 'EXPRESS' },
                        ],
                    })}
                />,
            )

            const links = screen.getAllByRole('link')
            expect(links[0]).toHaveAttribute(
                'href',
                'https://track.example.com/1',
            )
            expect(links[1]).toHaveAttribute(
                'href',
                'https://track.example.com/2',
            )
        })
    })
})
