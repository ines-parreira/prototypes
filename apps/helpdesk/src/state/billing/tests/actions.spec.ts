import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'

import client from '../../../models/api/resources'
import * as actions from '../actions'

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
    const mockServer = new MockAdapter(client)

    beforeEach(() => {
        mockServer.reset()
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
