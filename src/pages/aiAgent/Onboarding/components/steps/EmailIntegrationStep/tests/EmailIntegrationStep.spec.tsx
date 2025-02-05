import '@testing-library/jest-dom/extend-expect'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, screen} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import React from 'react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {chatIntegrationFixtures} from 'fixtures/chat'
import {integrationsState, shopifyIntegration} from 'fixtures/integrations'
import {EmailIntegrationStep} from 'pages/aiAgent/Onboarding/components/steps/EmailIntegrationStep/EmailIntegrationStep'
import {WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'

import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'

jest.mock('pages/common/hooks/useShopifyIntegrationAndScope', () => ({
    useShopifyIntegrationAndScope: jest.fn(),
}))

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockGoToStep = jest.fn()
const queryClient = new QueryClient()

const renderComponent = (state?: RootState) => {
    renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(state ?? defaultState)}>
                <EmailIntegrationStep
                    currentStep={2}
                    totalSteps={3}
                    goToStep={mockGoToStep}
                />
            </Provider>
        </QueryClientProvider>
    )
}

describe('EmailIntegrationStep', () => {
    beforeEach(() => {
        mockUseShopifyIntegrationAndScope.mockReturnValue({integration: true})
    })

    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('should render without crashing', () => {
        renderComponent()

        jest.runAllTimers()

        expect(screen.getByText('Email Integration step')).toBeInTheDocument()
    })

    it('navigates to the Channels step when Next is clicked', () => {
        renderComponent()

        jest.runAllTimers()

        expect(screen.getByText('Email Integration step')).toBeInTheDocument()

        fireEvent.click(screen.getByText(/Next/i))

        expect(mockGoToStep).toHaveBeenCalledWith(WizardStepEnum.CHANNELS)
    })

    it('navigates back to Shopify Integration if integration is missing', () => {
        mockUseShopifyIntegrationAndScope.mockReturnValue({integration: false})
        renderComponent()

        jest.runAllTimers()

        expect(screen.getByText('Email Integration step')).toBeInTheDocument()

        fireEvent.click(screen.getByText(/Back/i))
        expect(mockGoToStep).toHaveBeenCalledWith(
            WizardStepEnum.SHOPIFY_INTEGRATION
        )
    })

    it('navigates back to Skillset if integration exists', () => {
        renderComponent()

        jest.runAllTimers()

        expect(screen.getByText('Email Integration step')).toBeInTheDocument()

        fireEvent.click(screen.getByText(/Back/i))
        expect(mockGoToStep).toHaveBeenCalledWith(WizardStepEnum.SKILLSET)
    })
})
