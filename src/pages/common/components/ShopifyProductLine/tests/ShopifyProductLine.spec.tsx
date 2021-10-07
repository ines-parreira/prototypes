import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import {Provider} from 'react-redux'

import ShopifyProductLine from '../ShopifyProductLine'
import {shopifyProductResult} from '../../../../../fixtures/shopify'

const minProps = {
    shopifyIntegration: fromJS({
        id: 1,
        name: 'My store',
        domain: 'my-store.com',
    }),
    resetStoreChoice: jest.fn(),
}

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('<ShopifyProductLine/>', () => {
    let mockServer: MockAdapter
    let store = mockStore({})
    beforeEach(() => {
        jest.clearAllMocks()
        mockServer = new MockAdapter(axios)
        store = mockStore({})
    })

    it('should render the product picker', () => {
        const {container} = render(
            <Provider store={store}>
                <ShopifyProductLine {...minProps} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should render the product picker with products', async () => {
        mockServer
            .onGet('/api/integrations/1/product/')
            .reply(200, {data: shopifyProductResult()})

        const {container, getByText} = render(
            <Provider store={store}>
                <ShopifyProductLine {...minProps} />{' '}
            </Provider>
        )

        await waitFor(() => {
            expect(getByText(/Strong phone/i)).toBeDefined()
            expect(container).toMatchSnapshot()
        })
    })

    it('should render the variants picker of a product', async () => {
        mockServer
            .onGet('/api/integrations/1/product/')
            .reply(200, {data: shopifyProductResult()})

        const {container, getByText} = render(
            <Provider store={store}>
                <ShopifyProductLine {...minProps} />{' '}
            </Provider>
        )

        await waitFor(() => {
            expect(getByText(/Black shirt/i)).toBeDefined()
            fireEvent.click(getByText(/Black shirt/i))
            expect(getByText(/781A899/i)).toBeDefined()
            expect(container).toMatchSnapshot()
        })
    })
})
