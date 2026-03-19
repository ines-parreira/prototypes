import React from 'react'

import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { selfServiceConfiguration1 } from 'fixtures/self_service_configurations'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import CreateReportOrderIssueFlowScenarioView from '../CreateReportOrderIssueFlowScenarioView'
import CreateReportOrderIssueFlowScenarioViewContainer from '../CreateReportOrderIssueFlowScenarioViewContainer'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock('hooks/aiAgent/useAiAgentAccess')

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    Redirect: jest.fn(() => <div>Redirect</div>),
}))

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])({
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS({
        products: [],
    }),
} as RootState)

describe('<CreateReportOrderIssueFlowScenarioView />', () => {
    beforeEach(() => {
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: selfServiceConfiguration1,
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })
    })

    it('should render order issue flow scenario view', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <CreateReportOrderIssueFlowScenarioView />
            </Provider>,
        )

        expect(screen.getByText('Create scenario')).toBeInTheDocument()
    })
})

describe('<CreateReportOrderIssueFlowScenarioViewContainer />', () => {
    beforeEach(() => {
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: selfServiceConfiguration1,
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })
        ;(useAiAgentAccess as jest.Mock).mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
    })

    it('should redirect when user does not have access', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <CreateReportOrderIssueFlowScenarioViewContainer />
            </Provider>,
        )

        expect(screen.getByText('Redirect')).toBeInTheDocument()
    })

    it('should render order issue flow scenario view when user has access', () => {
        ;(useAiAgentAccess as jest.Mock).mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <CreateReportOrderIssueFlowScenarioViewContainer />
            </Provider>,
        )

        expect(screen.getByText('Create scenario')).toBeInTheDocument()
    })
})
