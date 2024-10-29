import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, {ComponentProps} from 'react'

import EmailIntegrationListVerificationStatus from '../EmailIntegrationListVerificationStatus'

jest.mock('hooks/useId', () => () => 'id')

describe('EmailIntegrationListVerificationStatus', () => {
    const renderComponent = (
        props: ComponentProps<typeof EmailIntegrationListVerificationStatus>
    ) => render(<EmailIntegrationListVerificationStatus {...props} />)

    it('should render Reconnect button and Tooltip when not active and isGmail is true', async () => {
        renderComponent({
            active: false,
            isGmail: true,
            isOutlook: false,
            isVerified: false,
            isRowSubmitting: false,
            redirectURI: 'http://example.com',
            isDomainVerificationWarningVisible: false,
            isDomainVerificationWarningGmailOutlookVisible: false,
            isOutboundVerificationWarningVisible: false,
        })

        userEvent.hover(screen.getByText('Reconnect'))

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Login credentials required to reconnect email'
                )
            ).toBeInTheDocument()
        })
    })

    it('should render Not verified message when not isGmail, not isOutlook, and not isVerified', () => {
        renderComponent({
            active: true,
            isGmail: false,
            isOutlook: false,
            isVerified: false,
            isRowSubmitting: false,
            redirectURI: '',
            isDomainVerificationWarningVisible: false,
            isDomainVerificationWarningGmailOutlookVisible: false,
            isOutboundVerificationWarningVisible: false,
        })

        expect(screen.getByText('Not verified')).toBeInTheDocument()
    })

    it('should render Pending domain verification message when isDomainVerificationWarningVisible is true', () => {
        renderComponent({
            active: true,
            isGmail: false,
            isOutlook: false,
            isVerified: true,
            isRowSubmitting: false,
            redirectURI: '',
            isDomainVerificationWarningVisible: true,
            isDomainVerificationWarningGmailOutlookVisible: false,
            isOutboundVerificationWarningVisible: false,
        })

        expect(
            screen.getByText('Pending domain verification')
        ).toBeInTheDocument()
    })

    it('should render Pending outbound verification message when isOutboundVerificationWarningVisible is true', () => {
        renderComponent({
            active: true,
            isGmail: false,
            isOutlook: false,
            isVerified: true,
            isRowSubmitting: false,
            redirectURI: '',
            isDomainVerificationWarningVisible: false,
            isDomainVerificationWarningGmailOutlookVisible: false,
            isOutboundVerificationWarningVisible: true,
        })

        expect(
            screen.getByText('Pending outbound verification')
        ).toBeInTheDocument()
    })

    it('should open redirectURI when Reconnect button is clicked', () => {
        const openSpy = jest
            .spyOn(window, 'open')
            .mockImplementation(() => null)

        renderComponent({
            active: false,
            isGmail: true,
            isOutlook: false,
            isVerified: false,
            isRowSubmitting: false,
            redirectURI: 'http://example.com',
            isDomainVerificationWarningVisible: false,
            isDomainVerificationWarningGmailOutlookVisible: false,
            isOutboundVerificationWarningVisible: false,
        })

        fireEvent.click(screen.getByText('Reconnect'))
        expect(openSpy).toHaveBeenCalledWith('http://example.com')

        openSpy.mockRestore()
    })
})
