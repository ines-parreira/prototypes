import React from 'react'

import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { selfServiceConfiguration1 } from 'fixtures/self_service_configurations'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import CreateReportOrderIssueFlowScenarioView from '../CreateReportOrderIssueFlowScenarioView'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')

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
