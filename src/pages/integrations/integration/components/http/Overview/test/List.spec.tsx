import React from 'react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {integrationBase} from 'fixtures/integrations'
import {IntegrationType} from 'models/integration/constants'
import List from '../List'

const integrationsState = {
    integrations: [
        {...integrationBase, type: IntegrationType.Http},
        {...integrationBase, type: IntegrationType.Http, id: 2},
        {...integrationBase, type: IntegrationType.Shopify, id: 3},
    ],
    state: {
        loading: {},
    },
}

const mockStore = configureMockStore([thunk])
const store = mockStore({integrations: fromJS(integrationsState)})

jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loader</div>
))

describe('List', () => {
    it('should render a loader', () => {
        const {queryByText} = render(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        ...integrationsState,
                        state: {loading: {integrations: true}},
                    }),
                })}
            >
                <List />
            </Provider>
        )

        expect(queryByText('Loader'))
    })

    it('should render the list of HTTP integrations', () => {
        const {queryAllByText} = render(
            <Provider store={store}>
                <List />
            </Provider>
        )

        expect(queryAllByText(integrationBase.name)).toHaveLength(2)
    })

    it('should render a button to add a new integration', () => {
        const {queryByText} = render(
            <Provider store={store}>
                <List />
            </Provider>
        )

        expect(queryByText('Add HTTP integration'))
    })
})
