import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import createMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { EmailIntegration } from '@gorgias/helpdesk-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import EmailIntegrationOnboarding from 'pages/integrations/integration/components/email/CustomerOnboarding/EmailIntegrationOnboarding'
import EmailIntegrationOnboardingDomainVerification from 'pages/integrations/integration/components/email/CustomerOnboarding/EmailIntegrationOnboardingDomainVerification'
import DomainVerificationProvider from 'pages/integrations/integration/components/email/EmailDomainVerification/DomainVerificationProvider'
import EmailDomainVerificationSupportContentSidebar from 'pages/integrations/integration/components/email/EmailDomainVerification/EmailDomainVerificationSupportContentSidebar'
import { getDomainFromEmailAddress } from 'pages/integrations/integration/components/email/helpers'
import {
    EmailIntegrationOnboardingStep,
    useEmailOnboarding,
    UseEmailOnboardingHookResult,
} from 'pages/integrations/integration/components/email/hooks/useEmailOnboarding'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

jest.mock(
    'pages/integrations/integration/components/email/EmailDomainVerification/DomainVerificationProvider',
)
jest.mock(
    'pages/integrations/integration/components/email/hooks/useEmailOnboarding',
)
jest.mock(
    'pages/integrations/integration/components/email/BaseEmailIntegrationInputField',
    () => () => '<BaseEmailIntegrationInputField />',
)
jest.mock('pages/integrations/integration/components/email/helpers')
jest.mock(
    'pages/integrations/integration/components/email/EmailDomainVerification/EmailDomainVerificationSupportContentSidebar',
)
jest.mock(
    'pages/integrations/integration/components/email/CustomerOnboarding/EmailIntegrationOnboardingDomainVerification',
)

const mockStore = createMockStore<Partial<RootState>, StoreDispatch>([thunk])
const queryClient = mockQueryClient()

const useEmailOnboardingMock = assumeMock(useEmailOnboarding)
const DomainVerificationProviderMock = assumeMock(DomainVerificationProvider)
const getDomainFromEmailAddressMock = assumeMock(getDomainFromEmailAddress)
const SupportContentSidebarMock = assumeMock(
    EmailDomainVerificationSupportContentSidebar,
)
const EmailIntegrationOnboardingDomainVerificationMock = assumeMock(
    EmailIntegrationOnboardingDomainVerification,
)

const store = mockStore({
    currentAccount: fromJS({
        current_subscription: {
            products: {},
        },
    }),
    billing: fromJS({
        products: [
            {
                type: 'helpdesk',
                prices: [
                    {
                        name: 'enterprise',
                        plan_id: 'enterprise',
                        price_id: 'enterprise_price',
                    },
                ],
            },
        ],
    }),
})

const renderComponent = () =>
    render(
        <MemoryRouter>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <EmailIntegrationOnboarding
                        integration={
                            {
                                id: 1,
                                meta: {
                                    address: 'email@gorgias.com',
                                },
                            } as EmailIntegration
                        }
                    />
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>,
    )

describe('<EmailIntegrationOnboarding />', () => {
    beforeEach(() => {
        DomainVerificationProviderMock.mockImplementation(
            ({ children }: any) => (
                <div>
                    <div>DomainVerificationProvider</div>
                    {children}
                </div>
            ),
        )
        SupportContentSidebarMock.mockReturnValue(
            <div>DomainVerificationSidebar</div>,
        )
        EmailIntegrationOnboardingDomainVerificationMock.mockReturnValue(
            <div>DomainVerificationOnboarding</div>,
        )
        getDomainFromEmailAddressMock.mockReturnValue('gorgias.com')
        mockFlags({
            [FeatureFlagKey.ForceEmailOnboarding]: false,
        })
    })

    it('should show the wizard breadcrumbs', () => {
        useEmailOnboardingMock.mockReturnValue({
            currentStep: EmailIntegrationOnboardingStep.ConnectIntegration,
        } as UseEmailOnboardingHookResult)

        renderComponent()

        expect(screen.getByText('Connect email')).toBeInTheDocument()
        expect(screen.getByText('Set up forwarding')).toBeInTheDocument()
        expect(screen.getByText('Verify domain')).toBeInTheDocument()
    })

    it('should render the connect form as step 1', () => {
        useEmailOnboardingMock.mockReturnValue({
            currentStep: EmailIntegrationOnboardingStep.ConnectIntegration,
        } as UseEmailOnboardingHookResult)

        renderComponent()

        expect(screen.getByText('Add your support email')).toBeInTheDocument()
    })

    it('should render the forwarding setup form as step 2', () => {
        useEmailOnboardingMock.mockReturnValue({
            currentStep: EmailIntegrationOnboardingStep.SetupForwarding,
        } as UseEmailOnboardingHookResult)

        renderComponent()

        expect(
            screen.getByText('Forward customer emails to Gorgias'),
        ).toBeInTheDocument()
    })

    it('should render the domain verification page as step 3', () => {
        useEmailOnboardingMock.mockReturnValue({
            currentStep: EmailIntegrationOnboardingStep.DomainVerification,
        } as UseEmailOnboardingHookResult)

        renderComponent()

        expect(
            screen.getByText('DomainVerificationProvider'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('DomainVerificationOnboarding'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('DomainVerificationSidebar'),
        ).toBeInTheDocument()
        expect(DomainVerificationProviderMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                domainName: 'gorgias.com',
            }),
            {},
        )
    })

    it('should show EmailPreview sidebar on connect integration step', () => {
        useEmailOnboardingMock.mockReturnValue({
            currentStep: EmailIntegrationOnboardingStep.ConnectIntegration,
        } as UseEmailOnboardingHookResult)

        renderComponent()

        expect(screen.getByText('Add your support email')).toBeInTheDocument()
        expect(screen.getByText('Email preview')).toBeInTheDocument()
    })

    it('should show domain verification sidebar on domain verification step', () => {
        useEmailOnboardingMock.mockReturnValue({
            currentStep: EmailIntegrationOnboardingStep.DomainVerification,
        } as UseEmailOnboardingHookResult)

        renderComponent()

        expect(
            screen.getByText('DomainVerificationSidebar'),
        ).toBeInTheDocument()
    })

    it('should not render domain verification step content if no integration', () => {
        useEmailOnboardingMock.mockReturnValue({
            currentStep: EmailIntegrationOnboardingStep.DomainVerification,
        } as UseEmailOnboardingHookResult)

        render(
            <MemoryRouter>
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <EmailIntegrationOnboarding integration={undefined} />
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )

        expect(
            screen.queryByText('DomainVerificationProvider'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('DomainVerificationOnboarding'),
        ).not.toBeInTheDocument()
    })
})
