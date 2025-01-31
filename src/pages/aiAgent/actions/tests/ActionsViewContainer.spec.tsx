import {QueryClientProvider} from '@tanstack/react-query'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import {billingState} from 'fixtures/billing'
import {IntegrationType} from 'models/integration/constants'
import {
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'

import ActionsViewContainer from '../ActionsViewContainer'
import {actionConfigurationFixture} from '../hooks/tests/actions.fixtures'

jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('../components/ActionsList', () => () => <div>ActionsList</div>)

jest.mock('models/workflows/queries', () => ({
    useGetStoreWorkflowsConfigurations: jest.fn(),
    useGetWorkflowConfigurationTemplates: jest.fn(),
}))

const mockUseGetStoreWorkflowsConfigurations = jest.mocked(
    useGetStoreWorkflowsConfigurations
)
const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates
)

const mockStore = configureMockStore([thunk])

const MOCK_EMAIL_ADDRESS = 'test@mail.com'

const defaultState = {
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Email,
                name: 'My email integration',
                meta: {
                    address: MOCK_EMAIL_ADDRESS,
                },
            },
        ],
    }),
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': {id: 1, name: 'help center 1', type: 'faq'},
                    '2': {id: 2, name: 'help center 2', type: 'faq'},
                },
            },
        },
    },
}

const queryClient = mockQueryClient()

const renderComponent = () => {
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <ActionsViewContainer />
            </QueryClientProvider>
        </Provider>
    )
}

describe('ActionsViewContainer', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue({
            data: [actionConfigurationFixture],
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreWorkflowsConfigurations>)
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
        mockFlags({
            [FeatureFlagKey.ActionsUseCaseTemplates]: false,
        })
    })

    it('renders without error', () => {
        renderComponent()
    })
})
