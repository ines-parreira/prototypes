import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import MockAdapter from 'axios-mock-adapter'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import client from 'models/api/resources'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RootState, StoreDispatch} from 'state/types'

import CreditShopifyBillingIntegration from '../CreditShopifyBillingIntegration'

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(() => () => Promise.resolve()),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const store = mockStore({})
const mockedServer = new MockAdapter(client)

describe('<CreditShopifyBillingIntegration />', () => {
    beforeEach(() => {
        mockedServer.onPost('/api/integrations/shopify/tasks').reply(200)
        jest.clearAllMocks()
    })

    it('should render the form', () => {
        const {container} = render(
            <Provider store={store}>
                <CreditShopifyBillingIntegration />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should submit the form', async () => {
        const {getByText, getByLabelText} = render(
            <Provider store={store}>
                <CreditShopifyBillingIntegration />
            </Provider>
        )

        fireEvent.change(getByLabelText('Description'), {
            target: {value: 'One month free of charge for a loyal customer'},
        })
        fireEvent.change(getByLabelText('Credit amount'), {
            target: {value: '360'},
        })

        fireEvent.click(getByText('Add credit'))
        fireEvent.click(getByText('Confirm'))

        await waitFor(() => {
            expect(notify).toHaveBeenCalledWith({
                message: 'Amount successfully credited to Shopify account.',
                status: NotificationStatus.Success,
            })
        })
    })

    it('should disable the submit button when form is not valid', async () => {
        const {getByText, getByLabelText} = render(
            <Provider store={store}>
                <CreditShopifyBillingIntegration />
            </Provider>
        )

        fireEvent.change(getByLabelText('Description'), {
            target: {value: 'One month free of charge for a loyal customer'},
        })

        const button = getByText('Add credit')

        expect(button).toHaveProperty('disabled')

        await waitFor(() => {
            fireEvent.click(button)
            expect(notify).not.toHaveBeenCalled()
        })
    })

    it('should fail the request by rendering a notification', async () => {
        const errorMessage = 'No es possible'
        mockedServer.onPost('/api/integrations/shopify/tasks').reply(400, {
            error: {msg: errorMessage},
        })

        const {getByText, getByLabelText} = render(
            <Provider store={store}>
                <CreditShopifyBillingIntegration />
            </Provider>
        )

        fireEvent.change(getByLabelText('Description'), {
            target: {value: 'One month free of charge for a loyal customer'},
        })
        fireEvent.change(getByLabelText('Credit amount'), {
            target: {value: '360'},
        })

        fireEvent.click(getByText('Add credit'))
        fireEvent.click(getByText('Confirm'))

        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                message: errorMessage,
                status: NotificationStatus.Error,
            })
        })
    })
})
