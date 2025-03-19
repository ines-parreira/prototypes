import React from 'react'

import { screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import { Route, StaticRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { AGENT_ROLE } from 'config/user'
import { user } from 'fixtures/users'
import { IntegrationType, StoreIntegration } from 'models/integration/types'
import { useStoreSelector } from 'settings/automate'
import { getHasAutomate } from 'state/billing/selectors'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { BASE_PATH, FlowsSettings } from '../FlowsSettings'

jest.mock('settings/automate', () => ({
    ...jest.requireActual('settings/automate'),
    useStoreSelector: jest.fn(),
}))

jest.mock('state/billing/selectors', () => ({ getHasAutomate: jest.fn() }))
const getHasAutomateMock = assumeMock(getHasAutomate)

const useStoreSelectorMock = assumeMock(useStoreSelector)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const initialState = {
    currentAccount: Map({
        id: 12345,
    }),
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS({
        products: [],
    }),
    currentUser: fromJS({
        ...user,
        role: {
            name: AGENT_ROLE,
        },
    }),
}

describe('FlowsSettings', () => {
    const integrations = [
        {
            id: 1,
            type: IntegrationType.Shopify,
            name: 'my-first-store',
            meta: {},
        },
    ] as StoreIntegration[]

    let onChange: jest.Mock

    beforeEach(() => {
        onChange = jest.fn()
        getHasAutomateMock.mockReturnValue(true)
        useStoreSelectorMock.mockReturnValue({
            integrations,
            onChange,
            selected: undefined,
        })
    })

    it('should render the header', () => {
        renderWithQueryClientProvider(
            <Provider store={mockStore(initialState)}>
                <StaticRouter location={BASE_PATH}>
                    <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                        <FlowsSettings />
                    </Route>
                </StaticRouter>
            </Provider>,
        )
        expect(screen.getByText('Flows')).toBeInTheDocument()
    })

    it('should not render the navigation if no store is selected', () => {
        renderWithQueryClientProvider(
            <Provider store={mockStore(initialState)}>
                <StaticRouter location={BASE_PATH}>
                    <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                        <FlowsSettings />
                    </Route>
                </StaticRouter>
            </Provider>,
        )
        expect(screen.queryByText('Configuration')).not.toBeInTheDocument()
    })

    it('should render the navigation once a store has been selected', () => {
        useStoreSelectorMock.mockReturnValue({
            integrations,
            onChange,
            selected: integrations[0],
        })

        renderWithQueryClientProvider(
            <Provider store={mockStore(initialState)}>
                <StaticRouter location={`${BASE_PATH}/shopify/my-first-store`}>
                    <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                        <FlowsSettings />
                    </Route>
                </StaticRouter>
                ,
            </Provider>,
        )
        expect(screen.getByText('Configuration')).toBeInTheDocument()
    })
})
