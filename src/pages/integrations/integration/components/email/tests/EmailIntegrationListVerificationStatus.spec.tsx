import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'

import { EmailIntegration } from '@gorgias/helpdesk-queries'

import { IntegrationType } from 'models/integration/types'

import EmailIntegrationListVerificationStatus from '../EmailIntegrationListVerificationStatus'
import {
    EmailVerificationStatus,
    getEmailVerificationStatus,
} from '../getEmailVerificationStatus'

jest.mock('../getEmailVerificationStatus')

const getEmailVerificationStatusMock = jest.mocked(getEmailVerificationStatus)

const mockIntegration = {
    id: 1,
    name: 'Test Email',
    type: IntegrationType.Email,
    meta: { address: 'test@example.com' },
} as EmailIntegration

describe('EmailIntegrationListVerificationStatus', () => {
    const renderComponent = (
        props: ComponentProps<typeof EmailIntegrationListVerificationStatus>,
    ) => render(<EmailIntegrationListVerificationStatus {...props} />)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it.each([
        [EmailVerificationStatus.UnverifiedEmail, 'Verify Email'],
        [EmailVerificationStatus.UnconnectedEmail, 'Reconnect Email'],
        [EmailVerificationStatus.UnverifiedDomain, 'Verify Domain'],
        [EmailVerificationStatus.Verified, 'Verified'],
    ])('should render "%s" badge when status is %s', (status, expectedText) => {
        getEmailVerificationStatusMock.mockReturnValue(status)

        renderComponent({
            integration: mockIntegration,
            isDomainVerificationWarningVisible: true,
        })

        expect(screen.getByText(expectedText)).toBeInTheDocument()
        expect(getEmailVerificationStatusMock).toHaveBeenCalledWith(
            mockIntegration,
            true,
        )
    })

    it('should pass integration and isDomainVerificationWarningVisible to getEmailVerificationStatus', () => {
        getEmailVerificationStatusMock.mockReturnValue(
            EmailVerificationStatus.Verified,
        )

        renderComponent({
            integration: mockIntegration,
            isDomainVerificationWarningVisible: true,
        })

        expect(getEmailVerificationStatusMock).toHaveBeenCalledWith(
            mockIntegration,
            true,
        )
    })

    it('should render error icon for error states', () => {
        getEmailVerificationStatusMock.mockReturnValue(
            EmailVerificationStatus.UnverifiedEmail,
        )

        renderComponent({
            integration: mockIntegration,
            isDomainVerificationWarningVisible: false,
        })

        expect(screen.getByText('error')).toBeInTheDocument()
        expect(screen.getByText('Verify Email')).toBeInTheDocument()
    })

    it('should render success icon for verified state', () => {
        getEmailVerificationStatusMock.mockReturnValue(
            EmailVerificationStatus.Verified,
        )

        renderComponent({
            integration: mockIntegration,
            isDomainVerificationWarningVisible: false,
        })

        expect(screen.getByText('check_circle')).toBeInTheDocument()
        expect(screen.getByText('Verified')).toBeInTheDocument()
    })
})
