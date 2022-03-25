import React from 'react'
import {render, waitFor, fireEvent} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import MockAdapter from 'axios-mock-adapter'
import client from 'models/api/resources'
import {RootState, StoreDispatch} from 'state/types'

import TwilioSubaccountStatusForm, {
    TwilioSubaccountStatus,
} from '../TwilioSubaccountStatusForm'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const store = mockStore({})
const mockedServer = new MockAdapter(client)

const statusData = {
    status: TwilioSubaccountStatus.Suspended,
    sub_account_sid: 'SID_123',
}

mockedServer.onGet('/api/integrations/phone/tasks').reply(200, {
    data: statusData,
})

describe('<TwilioSubaccountStatusForm />', () => {
    describe('render()', () => {
        it('should render with the Twillio subaccount details', async () => {
            const {container, queryByText} = render(
                <Provider store={store}>
                    <TwilioSubaccountStatusForm />
                </Provider>
            )

            await waitFor(() => {
                expect(queryByText('Twilio Subaccount SID')).not.toBe(null)
                expect(queryByText('Status')).not.toBe(null)
                expect(container).toMatchSnapshot()
            })
        })

        it('should allow updating the status', async () => {
            const {queryByText, getByText} = render(
                <Provider store={store}>
                    <TwilioSubaccountStatusForm />
                </Provider>
            )

            await waitFor(() => {
                expect(queryByText('Twilio Subaccount SID')).not.toBe(null)
                expect(queryByText('Status')).not.toBe(null)
                fireEvent.click(getByText('Active'))
                fireEvent.click(getByText('Save changes'))
                expect(mockedServer.history.post.length).toBe(1)
                expect(mockedServer.history.post[0].data).toBe(
                    JSON.stringify({
                        name: 'set_subaccount_status',
                        params: {status: 'active', sub_account_sid: 'SID_123'},
                    })
                )
            })
        })
    })
})
