import {EmailIntegration} from '@gorgias/api-queries'
import {fireEvent, render, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import {assumeMock} from 'utils/testing'

import EmailIntegrationListVerificationStatus from '../EmailIntegrationListVerificationStatus'
import {canIntegrationDomainBeVerified} from '../helpers'

jest.mock('../helpers')

const canIntegrationDomainBeVerifiedMock = assumeMock(
    canIntegrationDomainBeVerified
)

const integration = {
    id: 1,
    name: 'name',
    meta: {address: 'abc@gorgias.com'},
} as EmailIntegration

describe('EmailIntegrationListVerificationStatus', () => {
    const renderComponent = (
        props: ComponentProps<typeof EmailIntegrationListVerificationStatus>
    ) => render(<EmailIntegrationListVerificationStatus {...props} />)

    beforeEach(() => {
        canIntegrationDomainBeVerifiedMock.mockReturnValue(true)
    })

    it(`should not render anything if it's a forward, inbound verified, outbound unverified email but canIntegrationDomainBeVerified is false`, () => {
        canIntegrationDomainBeVerifiedMock.mockReturnValue(false)

        const {container} = renderComponent({
            integration,
            active: true,
            isForwardEmail: true,
            isVerified: true,
            isRowSubmitting: false,
            redirectURI: '',
            isDomainVerificationWarningVisible: true,
        })

        expect(container.innerHTML).toBe('')
    })

    it(`should not render anything if it's a gmail/outlook active integration but canIntegrationDomainBeVerified is false`, () => {
        canIntegrationDomainBeVerifiedMock.mockReturnValue(false)

        const {container} = renderComponent({
            integration,
            active: true,
            isForwardEmail: false,
            isVerified: true,
            isRowSubmitting: false,
            redirectURI: '',
            isDomainVerificationWarningVisible: false,
        })

        expect(container.innerHTML).toBe('')
    })

    it('should render Reconnect button and Tooltip when not active and isGmail is true', () => {
        renderComponent({
            integration,
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
            integration,
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
            integration,
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
            integration,
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
            integration,
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
            integration,
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
