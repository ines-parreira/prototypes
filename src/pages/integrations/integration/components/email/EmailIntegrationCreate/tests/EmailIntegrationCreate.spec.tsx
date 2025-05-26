import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'

import EmailIntegrationCreate from '../EmailIntegrationCreate'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

describe('<EmailIntegrationCreate/>', () => {
    beforeEach(() => {
        window.open = jest.fn()

        render(<EmailIntegrationCreate />)
        useAppSelectorMock
            .mockReturnValueOnce('testGmail')
            .mockReturnValueOnce('testOutlook')
    })

    it('should have correct link for email forwarding when email forwarding card is clicked', () => {
        const emailForwardingCard = screen.getByText('Email forwarding')

        const linkContainer = emailForwardingCard.closest('a[to]')

        expect(linkContainer).not.toBeNull()
        expect(linkContainer).toHaveAttribute(
            'to',
            '/app/settings/channels/email/new/onboarding',
        )
    })

    it('should open Gmail redirect URI on Gmail card click', () => {
        const gmailCard = screen.getByText('Gmail')

        fireEvent.click(gmailCard)

        expect(window.open).toHaveBeenCalledWith('testGmail')
    })

    it('should open Outlook redirect URI on Microsoft card click', () => {
        const outlookCard = screen.getByText('Microsoft 365')

        fireEvent.click(outlookCard)

        expect(window.open).toHaveBeenCalledWith('testOutlook')
    })

    it('should render Email integrations documentation link with correct URL', () => {
        const docsLink = screen.getByText('Email integrations')

        expect(docsLink).toBeInTheDocument()

        const linkElement = docsLink.closest('a')
        expect(linkElement).toHaveAttribute(
            'href',
            'https://docs.gorgias.com/en-US/email-integrations-81753#find-out-who-your-provider-is',
        )

        expect(linkElement).toHaveAttribute('target', '_blank')
        expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer')
    })
})
