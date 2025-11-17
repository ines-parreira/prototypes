import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import type { EmailIntegration } from '@gorgias/helpdesk-queries'

import PromptModal from 'pages/common/components/PromptModal'

import EmailIntegrationOnboardingButtons from '../CustomerOnboarding/EmailIntegrationOnboardingButtons'
import EmailIntegrationOnboardingDomainVerification from '../CustomerOnboarding/EmailIntegrationOnboardingDomainVerification'
import EmailDomainVerificationContent from '../EmailDomainVerification/EmailDomainVerificationContent'
import useDomainVerification from '../EmailDomainVerification/useDomainVerification'
import { useEmailOnboardingCompleteCheck } from '../hooks/useEmailOnboarding'

jest.mock('pages/common/components/PromptModal')
jest.mock('../EmailDomainVerification/EmailDomainVerificationContent')
jest.mock('../EmailDomainVerification/useDomainVerification')
jest.mock('../CustomerOnboarding/EmailIntegrationOnboardingButtons')
jest.mock('../hooks/useEmailOnboarding')

const EmailDomainVerificationContentMock = assumeMock(
    EmailDomainVerificationContent,
)
const useDomainVerificationMock = assumeMock(useDomainVerification)
const PromptModalMock = assumeMock(PromptModal)
const EmailIntegrationOnboardingButtonsMock = assumeMock(
    EmailIntegrationOnboardingButtons,
)
const useEmailOnboardingCompleteCheckMock = assumeMock(
    useEmailOnboardingCompleteCheck,
)

const integration = {
    id: 1,
    meta: {
        address: 'email@gorgias.com',
    },
} as EmailIntegration

describe('EmailIntegrationOnboardingDomainVerification', () => {
    const handleCancel = jest.fn()

    const renderComponent = () =>
        render(
            <EmailIntegrationOnboardingDomainVerification
                integration={integration}
                handleCancel={handleCancel}
            />,
        )

    const completeOnboarding = jest.fn()

    beforeEach(() => {
        EmailDomainVerificationContentMock.mockReturnValue(
            <div>EmailDomainVerificationContent</div>,
        )
        useDomainVerificationMock.mockReturnValue({
            domain: {},
        } as ReturnType<typeof useDomainVerification>)
        PromptModalMock.mockReturnValue(<div>PromptModal</div>)
        EmailIntegrationOnboardingButtonsMock.mockReturnValue(
            <div>EmailIntegrationOnboardingButtons</div>,
        )
        useEmailOnboardingCompleteCheckMock.mockReturnValue({
            completeOnboarding,
            isOnboardingComplete: false,
        } as ReturnType<typeof useEmailOnboardingCompleteCheck>)
    })

    it('should render domain verification content', () => {
        renderComponent()

        expect(
            screen.getByText('EmailDomainVerificationContent'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('EmailIntegrationOnboardingButtons'),
        ).toBeInTheDocument()
        expect(EmailDomainVerificationContentMock).toHaveBeenCalledWith(
            {
                integration,
            },
            {},
        )
        expect(EmailIntegrationOnboardingButtonsMock).toHaveBeenCalledWith(
            {
                integration,
                cancelCallback: handleCancel,
            },
            {},
        )
    })

    it('should call completeOnboarding when domain is verified', () => {
        useDomainVerificationMock.mockReturnValue({
            domain: {
                verified: true,
            },
        } as ReturnType<typeof useDomainVerification>)

        renderComponent()

        expect(completeOnboarding).toHaveBeenCalled()
    })
})
