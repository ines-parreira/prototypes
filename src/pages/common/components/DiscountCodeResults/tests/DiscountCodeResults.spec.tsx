import {render, waitFor} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'
import React from 'react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {discountCodeResult} from 'fixtures/discountCodes'
import {integrationsState} from 'fixtures/integrations'
import client from 'models/api/resources'

import DiscountCodeResults from '../DiscountCodeResults'

const minProps = {
    integration: fromJS({
        ...integrationsState.integration,
        meta: {
            ...integrationsState.integration.meta,
            oauth: {
                scope: ['read_discounts', 'write_discounts'],
            },
        },
    }),
    onDiscountSelected: jest.fn(),
    onResetStoreChoice: jest.fn(),
}

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('<DiscountCodeResults />', () => {
    const store = mockStore({})
    let mockServer: MockAdapter

    beforeEach(() => {
        mockServer = new MockAdapter(client)
    })

    it('should render the component', () => {
        const {container} = render(
            <Provider store={store}>
                <DiscountCodeResults {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the discount codes', async () => {
        mockServer
            .onGet('/api/discount-codes/5/')
            .reply(200, discountCodeResult())

        const {container, getByText} = render(
            <Provider store={store}>
                <DiscountCodeResults {...minProps} />
            </Provider>
        )

        await waitFor(() => {
            expect(getByText(/CODE1/i)).toBeDefined()
            expect(container).toMatchSnapshot()
        })
    })

    it('should render no results', async () => {
        mockServer.onGet('/api/discount-codes/5/').reply(200, {data: []})

        const {container, getByText} = render(
            <Provider store={store}>
                <DiscountCodeResults {...minProps} />
            </Provider>
        )

        await waitFor(() => {
            expect(getByText(/No results found/i)).toBeDefined()
            expect(container).toMatchSnapshot()
        })
    })
})
