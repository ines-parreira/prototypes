import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import useAppDispatch from 'hooks/useAppDispatch'
import client from 'models/api/resources'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { RootState, StoreDispatch } from 'state/types'
import { userEvent } from 'utils/testing/userEvent'

import RemoveShopifyBilling from '../RemoveShopifyBilling'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock
const dispatch = jest.fn()
useAppDispatchMock.mockReturnValue(dispatch)

jest.mock('state/notifications/actions')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const store = mockStore({})
const mockedServer = new MockAdapter(client)

describe('<RemoveShopifyBilling />', () => {
    beforeEach(() => {
        mockedServer.reset()
        mockedServer.onPost('/api/integrations/shopify/tasks').reply(200)
    })

    it('should submit the form', async () => {
        const { getByText, getByRole } = render(
            <Provider store={store}>
                <RemoveShopifyBilling />
            </Provider>,
        )

        const button = getByRole('button', { name: 'Remove Shopify Billing' })
        fireEvent.click(button)
        fireEvent.click(getByText('Confirm'))

        await waitFor(() => {
            expect(mockedServer.history.post.length).toBe(1)
            expect(mockedServer.history.post[0].data).toBe(
                JSON.stringify({
                    name: 'remove_shopify_billing',
                    params: {},
                }),
            )
        })

        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(notify).toHaveBeenNthCalledWith(1, {
            status: NotificationStatus.Success,
            message: 'Shopify billing removed succesfully.',
        })
    })

    it('should disable the submit button when the form is not valid', () => {
        const { getByRole } = render(
            <Provider store={store}>
                <RemoveShopifyBilling />
            </Provider>,
        )

        const button = getByRole('button', { name: 'Remove Shopify Billing' })
        expect(button).toHaveProperty('disabled')
    })

    it('should display error when backend returns an error', async () => {
        mockedServer.onPost('/api/integrations/shopify/tasks').reply(400)

        render(
            <Provider store={store}>
                <RemoveShopifyBilling />
            </Provider>,
        )
        const button = screen.getByRole('button', {
            name: 'Remove Shopify Billing',
        })
        userEvent.click(button)
        userEvent.click(screen.getByText('Confirm'))

        await waitFor(() => {
            expect(mockedServer.history.post.length).toBe(1)
            expect(mockedServer.history.post[0].data).toBe(
                JSON.stringify({
                    name: 'remove_shopify_billing',
                    params: {},
                }),
            )
        })

        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(notify).toHaveBeenNthCalledWith(1, {
            status: NotificationStatus.Error,
            message: undefined,
        })
    })
})
