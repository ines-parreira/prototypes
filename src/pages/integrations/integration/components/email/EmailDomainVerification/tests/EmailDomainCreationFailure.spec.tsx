import {screen, render} from '@testing-library/react'
import React from 'react'

import EmailDomainCreationFailure from '../EmailDomainCreationFailure'

describe('EmailDomainCreationFailure', () => {
    const renderComponent = () => render(<EmailDomainCreationFailure />)

    it('should render title, description and buttons', () => {
        renderComponent()

        expect(
            screen.getByText('There was an issue processing your request')
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Please contact support for assistance/)
        ).toBeInTheDocument()
        expect(screen.getByText('Close')).toBeInTheDocument()
        expect(screen.getByText('Contact support')).toBeInTheDocument()
    })

    it('should render correct href for contact support button', () => {
        renderComponent()

        expect(screen.getByText('Contact support')).toHaveAttribute(
            'href',
            'mailto:support@gorgias.com'
        )
    })

    it('should render correct link for close button', () => {
        renderComponent()

        expect(screen.getByText('Close').closest('a')).toHaveAttribute(
            'to',
            '/app/settings/channels/email'
        )
    })
})
