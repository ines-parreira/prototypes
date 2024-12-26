import {QueryClientProvider} from '@tanstack/react-query'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {IntegrationType} from 'models/integration/constants'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'

import ActionsViewContainer from '../ActionsViewContainer'

const mockStore = configureMockStore([thunk])

const MOCK_EMAIL_ADDRESS = 'test@mail.com'

const defaultState = {
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
    it('renders without error', () => {
        renderComponent()
    })
})
