import React from 'react'

import { fireEvent, render, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import client from 'models/api/resources'
import type { RootState, StoreDispatch } from 'state/types'

import CreateShopifyCharge from '../CreateShopifyCharge'

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(() => () => Promise.resolve()),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const store = mockStore({})
const mockedServer = new MockAdapter(client)

describe('<CreateShopifyCharge />', () => {
    beforeEach(() => {
        mockedServer.onPost('/api/integrations/shopify/tasks').reply(200)
    })

    it('should render the form', () => {
        const { getByText } = render(
            <Provider store={store}>
                <CreateShopifyCharge />
            </Provider>,
        )

        expect(getByText('Create Shopify charge')).toBeInTheDocument()
    })

    it('should submit the form', async () => {
        const { getByText, getByLabelText } = render(
            <Provider store={store}>
                <CreateShopifyCharge />
            </Provider>,
        )

        fireEvent.change(getByLabelText(/Amount/), {
            target: { value: 36.84 },
        })
        fireEvent.change(getByLabelText(/Details/), {
            target: { value: 'test charge' },
        })

        fireEvent.click(getByText('Create charge'))
        fireEvent.click(getByText('Confirm'))

        await waitFor(() => {
            expect(mockedServer.history.post.length).toBe(1)
            expect(mockedServer.history.post[0].data).toBe(
                JSON.stringify({
                    name: 'create_shopify_charge',
                    params: {
                        amount: 36.84,
                        description: 'test charge',
                    },
                }),
            )
        })
    })

    it('should disable the submit button when the form is not valid', () => {
        const { getByRole, getByLabelText } = render(
            <Provider store={store}>
                <CreateShopifyCharge />
            </Provider>,
        )

        // only filling one field, others remain empty
        fireEvent.change(getByLabelText(/Details/), {
            target: { value: 'test charge' },
        })

        const button = getByRole('button', { name: 'Create charge' })
        expect(button).toHaveProperty('disabled')
    })
})
