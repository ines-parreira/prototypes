import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import ActionEventTitle from './ActionEventTitle'

const renderComponent = (
    props: Partial<React.ComponentProps<typeof ActionEventTitle>> = {},
) => render(<ActionEventTitle {...props} />, {})

describe('ActionEventTitle', () => {
    it('renders the title text', () => {
        renderComponent({ title: 'My Action' })
        expect(screen.getByText('My Action')).toBeInTheDocument()
    })

    it('renders the webhooks icon for custom (http-request) actions', () => {
        renderComponent({ isCustomAction: true, title: 'Webhook step' })
        expect(screen.getByAltText('webhooks')).toBeInTheDocument()
    })

    it('renders the data_object material icon for liquid-template steps', () => {
        renderComponent({ isLiquidTemplate: true, title: 'Liquid step' })
        const icon = screen.getByLabelText('liquid template')
        expect(icon).toBeInTheDocument()
        expect(icon).toHaveTextContent('data_object')
    })

    it('renders the app image when an appImageUrl is provided', () => {
        renderComponent({
            appImageUrl: 'https://example.test/icon.png',
            appImageAlt: 'shopify',
            title: 'Cancel Order',
        })
        const img = screen.getByAltText('shopify')
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute('src', 'https://example.test/icon.png')
    })

    it('renders the status badge when a status is provided', () => {
        renderComponent({ title: 'Done step', status: 'success' })
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('SUCCESS')).toBeInTheDocument()
    })

    it('does not render the status section when no status is provided', () => {
        renderComponent({ title: 'No status step' })
        expect(screen.queryByText('Status')).not.toBeInTheDocument()
    })
})
