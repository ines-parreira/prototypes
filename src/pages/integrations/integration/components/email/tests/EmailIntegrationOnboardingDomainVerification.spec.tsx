import {EmailIntegration} from '@gorgias/api-queries'
import {screen, render} from '@testing-library/react'
import React from 'react'

import PromptModal from 'pages/common/components/PromptModal'
import {assumeMock} from 'utils/testing'

import EmailDomainVerificationContent from '../EmailDomainVerification/EmailDomainVerificationContent'
import useDomainVerification from '../EmailDomainVerification/useDomainVerification'
import EmailIntegrationOnboardingButtons from '../EmailIntegrationOnboardingButtons'
import EmailIntegrationOnboardingDomainVerification from '../EmailIntegrationOnboardingDomainVerification'
import {useEmailOnboardingCompleteCheck} from '../hooks/useEmailOnboarding'

jest.mock('pages/common/components/PromptModal')
jest.mock('../EmailDomainVerification/EmailDomainVerificationContent')
jest.mock('../EmailDomainVerification/useDomainVerification')
jest.mock('../EmailIntegrationOnboardingButtons')
jest.mock('../hooks/useEmailOnboarding')

const EmailDomainVerificationContentMock = assumeMock(
    EmailDomainVerificationContent
)
const useDomainVerificationMock = assumeMock(useDomainVerification)
const PromptModalMock = assumeMock(PromptModal)
const EmailIntegrationOnboardingButtonsMock = assumeMock(
    EmailIntegrationOnboardingButtons
)
const useEmailOnboardingCompleteCheckMock = assumeMock(
    useEmailOnboardingCompleteCheck
)

const integration = {
    id: 1,
    meta: {
        address: 'email@gorgias.com',
    },
} as EmailIntegration

describe('EmailIntegrationOnboardingDomainVerification', () => {
    const renderComponent = () =>
        render(
            <EmailIntegrationOnboardingDomainVerification
                integration={integration}
            />
        )

    const completeOnboarding = jest.fn()

    beforeEach(() => {
        EmailDomainVerificationContentMock.mockReturnValue(
            <div>EmailDomainVerificationContent</div>
        )
        useDomainVerificationMock.mockReturnValue({
            domain: {},
        } as ReturnType<typeof useDomainVerification>)
        PromptModalMock.mockReturnValue(<div>PromptModal</div>)
        EmailIntegrationOnboardingButtonsMock.mockReturnValue(
            <div>EmailIntegrationOnboardingButtons</div>
        )
        useEmailOnboardingCompleteCheckMock.mockReturnValue({
            completeOnboarding,
            isOnboardingComplete: false,
        } as ReturnType<typeof useEmailOnboardingCompleteCheck>)
    })

    it('should render domain verification content', () => {
        renderComponent()

        expect(
            screen.getByText('EmailDomainVerificationContent')
        ).toBeInTheDocument()
        expect(
            screen.getByText('EmailIntegrationOnboardingButtons')
        ).toBeInTheDocument()
        expect(EmailDomainVerificationContentMock).toHaveBeenCalledWith(
            {
                integration,
            },
            {}
        )
        expect(EmailIntegrationOnboardingButtonsMock).toHaveBeenCalledWith(
            {
                integration,
            },
            {}
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
