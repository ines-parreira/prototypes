import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'

import { EmailIntegration } from '@gorgias/api-queries'

import { assumeMock } from 'utils/testing'

import EmailIntegrationListVerificationStatus from '../EmailIntegrationListVerificationStatus'
import { canIntegrationDomainBeVerified } from '../helpers'

jest.mock('../helpers')

const canIntegrationDomainBeVerifiedMock = assumeMock(
    canIntegrationDomainBeVerified,
)

const integration = {
    id: 1,
    name: 'name',
    meta: { address: 'abc@gorgias.com' },
} as EmailIntegration

describe('EmailIntegrationListVerificationStatus', () => {
    const renderComponent = (
        props: ComponentProps<typeof EmailIntegrationListVerificationStatus>,
    ) => render(<EmailIntegrationListVerificationStatus {...props} />)

    beforeEach(() => {
        canIntegrationDomainBeVerifiedMock.mockReturnValue(true)
    })

    it(`should not render anything if it's a forward, inbound verified, outbound unverified email but canIntegrationDomainBeVerified is false`, () => {
        canIntegrationDomainBeVerifiedMock.mockReturnValue(false)

        const { container } = renderComponent({
            integration,
            active: true,
            isForwardEmail: true,
            isVerified: true,
            isRowSubmitting: false,
            redirectURI: '',
            isDomainVerificationWarningVisible: true,
        })

        expect(container.innerHTML).toContain('Verified')
    })

    it(`should render Verified if it's a gmail/outlook active integration but canIntegrationDomainBeVerified is false`, () => {
        canIntegrationDomainBeVerifiedMock.mockReturnValue(false)

        const { container } = renderComponent({
            integration,
            active: true,
            isForwardEmail: false,
            isVerified: true,
            isRowSubmitting: false,
            redirectURI: '',
            isDomainVerificationWarningVisible: false,
        })

        expect(container.textContent).toContain('Verified')
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

        expect(screen.getByText('Reconnect Email')).toBeInTheDocument()
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

        expect(screen.getByText('Verify Email')).toBeInTheDocument()
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

        expect(screen.getByText('Verify Domain')).toBeInTheDocument()
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

        expect(screen.getByText('Reconnect Email')).toBeInTheDocument()
    })
})
