import {QueryClientProvider} from '@tanstack/react-query'
import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {MemoryRouter} from 'react-router-dom'
import createMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import EmailIntegrationOnboarding from '../EmailIntegrationOnboarding'
import {
    EmailIntegrationOnboardingStep,
    UseEmailOnboardingHookResult,
    useEmailOnboarding,
} from '../hooks/useEmailOnboarding'

jest.mock('../hooks/useEmailOnboarding')
jest.mock(
    '../BaseEmailIntegrationInputField',
    () => () => '<BaseEmailIntegrationInputField />'
)

const mockStore = createMockStore<Partial<RootState>, StoreDispatch>([thunk])
const queryClient = mockQueryClient()

const useEmailOnboardingMock = assumeMock(useEmailOnboarding)

const store = mockStore({})

const renderComponent = () =>
    render(
        <MemoryRouter>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <EmailIntegrationOnboarding />
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>
    )

describe('<EmailIntegrationOnboarding />', () => {
    it('should the wizard breadcrumbs', () => {
        useEmailOnboardingMock.mockReturnValue({
            currentStep: EmailIntegrationOnboardingStep.ConnectIntegration,
        } as UseEmailOnboardingHookResult)

        renderComponent()

        expect(screen.getByText('Connect email')).toBeInTheDocument()
        expect(
            screen.getByText('Forward emails to Gorgias')
        ).toBeInTheDocument()
        expect(screen.getByText('Verify email integration')).toBeInTheDocument()
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
})
