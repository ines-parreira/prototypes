import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import client from '../../../models/api/resources'
import type { RootState, StoreDispatch } from '../../types'
import * as actions from '../actions'
import { initialState } from '../reducers'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('../../notifications/actions.ts', () => {
    return {
        notify: jest.fn(
            () =>
                <T>(args: T): T =>
                    args,
        ),
    }
})

describe('billing actions', () => {
    let store: MockStoreEnhanced<Partial<RootState>, StoreDispatch>
    const mockServer = new MockAdapter(client)

    beforeEach(() => {
        store = mockStore({
            billing: initialState,
            currentUser: fromJS({ id: 1 }),
            currentAccount: fromJS({ id: 1 }),
        })
        mockServer.reset()
    })

    it('fetch payment method', () => {
        const paymentMethod = {
            active: false,
            method: 'stripe',
        }

        mockServer
            .onGet('/api/billing/payment-method/')
            .reply(200, paymentMethod)

        return store
            .dispatch(actions.fetchPaymentMethod())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    describe('updateInvoiceInList()', () => {
        it('should return a Redux action to update an invoice in a list of invoices.', () => {
            const invoice = {
                id: 'in_dnu3xd0i2n3f0',
                paid: false,
            }
            expect(
                actions.updateInvoiceInList(fromJS(invoice)),
            ).toMatchSnapshot()
        })
    })
})
