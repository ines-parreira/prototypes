import {fireEvent, render, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import EmailIntegrationListVerificationStatus from '../EmailIntegrationListVerificationStatus'

describe('EmailIntegrationListVerificationStatus', () => {
    const renderComponent = (
        props: ComponentProps<typeof EmailIntegrationListVerificationStatus>
    ) => render(<EmailIntegrationListVerificationStatus {...props} />)

    it('should render Reconnect button and Tooltip when not active and isGmail is true', () => {
        renderComponent({
            active: false,
            isForwardEmail: false,
            isVerified: false,
            isRowSubmitting: false,
            redirectURI: 'http://example.com',
            isDomainVerificationWarningVisible: false,
        })

        expect(
            screen.getByText('Action Required: Reconnect Email')
        ).toBeInTheDocument()
    })

    it('should render Not verified message when isForwardEmail is true and isVerified is false', () => {
        renderComponent({
            active: true,
            isForwardEmail: true,
            isVerified: false,
            isRowSubmitting: false,
            redirectURI: '',
            isDomainVerificationWarningVisible: false,
        })

        expect(
            screen.getByText('Action Required: Verify Email')
        ).toBeInTheDocument()
    })

    it('should render  "Verify domain" message when isDomainVerificationWarningVisible is true', () => {
        renderComponent({
            active: true,
            isForwardEmail: true,
            isVerified: true,
            isRowSubmitting: false,
            redirectURI: '',
            isDomainVerificationWarningVisible: true,
        })

        expect(
            screen.getByText('Action Required: Verify Domain')
        ).toBeInTheDocument()
    })

    it('should open redirectURI when Reconnect button is clicked', () => {
        const openSpy = jest
            .spyOn(window, 'open')
            .mockImplementation(() => null)

        renderComponent({
            active: false,
            isForwardEmail: false,
            isVerified: false,
            isRowSubmitting: false,
            redirectURI: 'http://example.com',
            isDomainVerificationWarningVisible: false,
        })

        fireEvent.click(screen.getByText('Action Required: Reconnect Email'))
        expect(openSpy).toHaveBeenCalledWith('http://example.com')

        openSpy.mockRestore()
    })

    it('should render "Verified" status', () => {
        renderComponent({
            active: true,
            isForwardEmail: false,
            isVerified: true,
            isRowSubmitting: false,
            redirectURI: '',
            isDomainVerificationWarningVisible: false,
        })

        expect(screen.getByText('Verified')).toBeInTheDocument()
    })

    it('should display Reconnect if active is false and isDomainVerificationWarningVisible is true', () => {
        renderComponent({
            active: false,
            isForwardEmail: false,
            isVerified: true,
            isRowSubmitting: false,
            redirectURI: '',
            isDomainVerificationWarningVisible: true,
        })

        expect(
            screen.getByText('Action Required: Reconnect Email')
        ).toBeInTheDocument()
    })
})
