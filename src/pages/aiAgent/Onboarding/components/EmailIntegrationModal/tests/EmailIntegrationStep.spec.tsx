import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom/extend-expect'

import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'

import EmailIntegrationModal from '../EmailIntegrationModal'

// Mock the useEmailIntegrations hook
jest.mock('pages/settings/contactForm/hooks/useEmailIntegrations')

const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock

describe('EmailIntegrationModal', () => {
    const mockOnClose = jest.fn()
    const mockRedirectToIntegration = jest.fn()

    beforeEach(() => {
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: true,
            defaultIntegration: true,
        })
    })

    it('should render the modal with correct title', () => {
        render(
            <EmailIntegrationModal
                isOpen={true}
                onClose={mockOnClose}
                redirectToIntegration={mockRedirectToIntegration}
            />,
        )

        expect(screen.getByText("Let's connect your email")).toBeInTheDocument()
    })

    it('should render Gmail and Microsoft integration cards', () => {
        render(
            <EmailIntegrationModal
                isOpen={true}
                onClose={mockOnClose}
                redirectToIntegration={mockRedirectToIntegration}
            />,
        )

        expect(screen.getAllByText('Connect Gmail')[0]).toBeInTheDocument()
        expect(screen.getAllByText('Connect Microsoft')[0]).toBeInTheDocument()
    })

    it('should call redirectToIntegration with correct URL when Gmail card is clicked', () => {
        render(
            <EmailIntegrationModal
                isOpen={true}
                onClose={mockOnClose}
                redirectToIntegration={mockRedirectToIntegration}
            />,
        )

        userEvent.click(screen.getAllByText('Connect Gmail')[1])
        expect(mockRedirectToIntegration).toHaveBeenCalledWith(
            '/integrations/gmail/auth/pre-callback/',
        )
    })

    it('should call redirectToIntegration with correct URL when Microsoft card is clicked', () => {
        render(
            <EmailIntegrationModal
                isOpen={true}
                onClose={mockOnClose}
                redirectToIntegration={mockRedirectToIntegration}
            />,
        )

        userEvent.click(screen.getAllByText('Connect Microsoft')[1])
        expect(mockRedirectToIntegration).toHaveBeenCalledWith(
            '/integrations/outlook/auth/pre-callback/',
        )
    })

    it('should call redirectToIntegration with correct URL when "Need to connect another provider?" link is clicked', () => {
        render(
            <EmailIntegrationModal
                isOpen={true}
                onClose={mockOnClose}
                redirectToIntegration={mockRedirectToIntegration}
            />,
        )

        userEvent.click(screen.getByText('Need to connect another provider?'))
        expect(mockRedirectToIntegration).toHaveBeenCalledWith(
            '/app/settings/channels/email/new/onboarding',
        )
    })
})
