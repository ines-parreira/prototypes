import {EmailIntegration} from '@gorgias/api-queries'
import {QueryClientProvider} from '@tanstack/react-query'
import {render, screen} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import {MemoryRouter} from 'react-router-dom'
import createMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import {RootState, StoreDispatch} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import DomainVerificationProvider from '../EmailDomainVerification/DomainVerificationProvider'
import EmailDomainVerificationSupportContentSidebar from '../EmailDomainVerification/EmailDomainVerificationSupportContentSidebar'
import EmailIntegrationOnboarding from '../EmailIntegrationOnboarding'
import EmailIntegrationOnboardingDomainVerification from '../EmailIntegrationOnboardingDomainVerification'
import {getDomainFromEmailAddress} from '../helpers'
import {
    EmailIntegrationOnboardingStep,
    UseEmailOnboardingHookResult,
    useEmailOnboarding,
} from '../hooks/useEmailOnboarding'

jest.mock('../EmailDomainVerification/DomainVerificationProvider')
jest.mock('../hooks/useEmailOnboarding')
jest.mock(
    '../BaseEmailIntegrationInputField',
    () => () => '<BaseEmailIntegrationInputField />'
)
jest.mock('../helpers')
jest.mock(
    '../EmailDomainVerification/EmailDomainVerificationSupportContentSidebar'
)
jest.mock('../EmailIntegrationOnboardingDomainVerification')

const mockStore = createMockStore<Partial<RootState>, StoreDispatch>([thunk])
const queryClient = mockQueryClient()

const useEmailOnboardingMock = assumeMock(useEmailOnboarding)
const DomainVerificationProviderMock = assumeMock(DomainVerificationProvider)
const getDomainFromEmailAddressMock = assumeMock(getDomainFromEmailAddress)
const SupportContentSidebarMock = assumeMock(
    EmailDomainVerificationSupportContentSidebar
)
const EmailIntegrationOnboardingDomainVerificationMock = assumeMock(
    EmailIntegrationOnboardingDomainVerification
)

const store = mockStore({})

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
        </MemoryRouter>
    )

describe('<EmailIntegrationOnboarding />', () => {
    beforeEach(() => {
        DomainVerificationProviderMock.mockImplementation(({children}: any) => (
            <div>
                <div>DomainVerificationProvider</div>
                {children}
            </div>
        ))
        SupportContentSidebarMock.mockReturnValue(
            <div>DomainVerificationSidebar</div>
        )
        EmailIntegrationOnboardingDomainVerificationMock.mockReturnValue(
            <div>DomainVerificationOnboarding</div>
        )
        getDomainFromEmailAddressMock.mockReturnValue('gorgias.com')
        mockFlags({
            [FeatureFlagKey.NewDomainVerification]: true,
        })
    })

    it('should the wizard breadcrumbs', () => {
        useEmailOnboardingMock.mockReturnValue({
            currentStep: EmailIntegrationOnboardingStep.ConnectIntegration,
        } as UseEmailOnboardingHookResult)

        renderComponent()

        expect(screen.getByText('Connect email')).toBeInTheDocument()
        expect(screen.getByText('Receive emails')).toBeInTheDocument()
        expect(screen.getByText('Verify integration')).toBeInTheDocument()
        expect(screen.getByText('Send emails')).toBeInTheDocument()
    })

    it('should render the connect form as step 1', () => {
        useEmailOnboardingMock.mockReturnValue({
            currentStep: EmailIntegrationOnboardingStep.ConnectIntegration,
        } as UseEmailOnboardingHookResult)

        renderComponent()

        expect(
            screen.getByText('Connect your support email')
        ).toBeInTheDocument()
    })

    it('should render the forwarding setup form as step 2', () => {
        useEmailOnboardingMock.mockReturnValue({
            currentStep: EmailIntegrationOnboardingStep.ForwardingSetup,
        } as UseEmailOnboardingHookResult)

        renderComponent()

        expect(
            screen.getByText('Forward your support emails to Gorgias')
        ).toBeInTheDocument()
    })

    it('should render the verification page as step 3', () => {
        useEmailOnboardingMock.mockReturnValue({
            currentStep: EmailIntegrationOnboardingStep.Verification,
        } as UseEmailOnboardingHookResult)

        renderComponent()

        // TODO
    })

    it('should render the domain verification page as step 4', () => {
        useEmailOnboardingMock.mockReturnValue({
            currentStep: EmailIntegrationOnboardingStep.DomainVerification,
        } as UseEmailOnboardingHookResult)

        renderComponent()

        expect(
            screen.getByText('DomainVerificationProvider')
        ).toBeInTheDocument()
        expect(
            screen.getByText('DomainVerificationOnboarding')
        ).toBeInTheDocument()
        expect(
            screen.getByText('DomainVerificationSidebar')
        ).toBeInTheDocument()
        expect(DomainVerificationProviderMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                domainName: 'gorgias.com',
            }),
            {}
        )
    })

    it('should not display the domain verification step if the feature flag is disabled', () => {
        mockFlags({
            [FeatureFlagKey.NewDomainVerification]: false,
        })

        useEmailOnboardingMock.mockReturnValue({
            currentStep: EmailIntegrationOnboardingStep.ConnectIntegration,
        } as UseEmailOnboardingHookResult)

        renderComponent()

        expect(screen.queryByText('Send emails')).not.toBeInTheDocument()
    })
})
