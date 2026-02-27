import { screen } from '@testing-library/react'

import { render } from '../../../../tests/render.utils'
import { OrderShipmentSection } from './OrderShipmentSection'

describe('OrderShipmentSection', () => {
    describe('empty state', () => {
        it('renders the section when fulfillments is undefined', () => {
            render(<OrderShipmentSection />)

            expect(screen.getByText('Shipment')).toBeInTheDocument()
        })

        it('renders the section when fulfillments is null', () => {
            render(<OrderShipmentSection fulfillments={null} />)

            expect(screen.getByText('Shipment')).toBeInTheDocument()
        })

        it('renders the section when fulfillments is an empty array', () => {
            render(<OrderShipmentSection fulfillments={[]} />)

            expect(screen.getByText('Shipment')).toBeInTheDocument()
        })

        it('shows "-" for tracking URL when fulfillments is null', () => {
            render(<OrderShipmentSection fulfillments={null} />)

            expect(screen.getByText('Tracking URL')).toBeInTheDocument()
            expect(screen.getAllByText('-')[0]).toBeInTheDocument()
            expect(screen.queryByRole('link')).not.toBeInTheDocument()
        })

        it('shows "-" for tracking number when fulfillments is null', () => {
            render(<OrderShipmentSection fulfillments={null} />)

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
                    fulfillments={[{ tracking_url: trackingUrl }]}
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
                    fulfillments={[{ tracking_number: 'TBA326340941474' }]}
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
                    fulfillments={[
                        {
                            tracking_url: trackingUrl,
                            tracking_number: trackingNumber,
                        },
                    ]}
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
                    fulfillments={[{ tracking_number: 'TBA326340941474' }]}
                />,
            )

            expect(screen.getByText('-')).toBeInTheDocument()
            expect(screen.queryByRole('link')).not.toBeInTheDocument()
        })

        it('shows "-" for tracking number when only tracking_url is provided', () => {
            const trackingUrl =
                'https://track.amazon.com/tracking/TBA326340941474'

            render(
                <OrderShipmentSection
                    fulfillments={[{ tracking_url: trackingUrl }]}
                />,
            )

            expect(screen.getByText('-')).toBeInTheDocument()
        })

        it('renders tracking info for multiple fulfillments', () => {
            const firstUrl = 'https://track.amazon.com/tracking/TBA111111111111'
            const secondUrl =
                'https://tracking.ups.com/track?InquiryNumber=1Z123456'

            render(
                <OrderShipmentSection
                    fulfillments={[
                        {
                            tracking_url: firstUrl,
                            tracking_number: 'TBA111111111111',
                        },
                        {
                            tracking_url: secondUrl,
                            tracking_number: '1Z123456',
                        },
                    ]}
                />,
            )

            expect(
                screen.getByRole('link', { name: firstUrl }),
            ).toBeInTheDocument()
            expect(screen.getByText('TBA111111111111')).toBeInTheDocument()
            expect(
                screen.getByRole('link', { name: secondUrl }),
            ).toBeInTheDocument()
            expect(screen.getByText('1Z123456')).toBeInTheDocument()
        })
    })
})
