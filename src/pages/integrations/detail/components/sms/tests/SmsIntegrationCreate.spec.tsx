import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {updateOrCreateIntegration} from 'state/integrations/actions'
import {phoneNumbers} from 'fixtures/phoneNumber'

import SmsIntegrationCreate from '../SmsIntegrationCreate'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {
        phoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({...acc, [number.id]: number}),
            {}
        ),
    },
} as RootState)

store.dispatch = jest.fn()
jest.mock('state/integrations/actions', () => ({
    updateOrCreateIntegration: jest.fn(),
}))

describe('<SmsIntegrationCreate/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <Provider store={store}>
                    <SmsIntegrationCreate selectedPhoneNumberId={1} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should submit a valid payload with the selected phone_number_id', () => {
            const {container, getByText, getByLabelText} = render(
                <Provider store={store}>
                    <SmsIntegrationCreate selectedPhoneNumberId={1} />
                </Provider>
            )

            const payload = fromJS({
                type: 'sms',
                name: 'My SMS integration',
                meta: {
                    emoji: null,
                    twilio_phone_number_id: 1,
                },
            })

            fireEvent.change(getByLabelText('Integration title'), {
                target: {value: 'My SMS integration'},
            })

            fireEvent.click(getByText('Add SMS integration'))

            expect(updateOrCreateIntegration).toHaveBeenCalledWith(payload)
            expect(store.dispatch).toHaveBeenCalledTimes(1)
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
