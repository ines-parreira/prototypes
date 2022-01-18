import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {updateOrCreateIntegration} from 'state/integrations/actions'
import {phoneNumbers} from 'fixtures/phoneNumber'

import PhoneIntegrationCreateWithNumber from '../PhoneIntegrationCreateWithNumber'

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

describe('<PhoneIntegrationCreateWithNumber/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <Provider store={store}>
                    <PhoneIntegrationCreateWithNumber
                        selectedPhoneNumberId={1}
                    />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should submit a valid payload with the selected phone_number_id', () => {
            const {container, getByText} = render(
                <Provider store={store}>
                    <PhoneIntegrationCreateWithNumber
                        selectedPhoneNumberId={1}
                    />
                </Provider>
            )

            const payload = fromJS({
                type: 'phone',
                name: '',
                meta: {
                    emoji: null,
                    function: 'standard',
                    twilio_phone_number_id: 1,
                    preferences: {
                        record_inbound_calls: false,
                        voicemail_outside_business_hours: true,
                        record_outbound_calls: false,
                    },
                    voicemail: {
                        voice_message_type: 'text_to_speech',
                        text_to_speech_content:
                            "Hello, unfortunately we aren't able to take your call right now. Please call us back later. Thank you!",
                        allow_to_leave_voicemail: true,
                    },
                    greeting_message: {
                        voice_message_type: 'none',
                        text_to_speech_content: null,
                    },
                    ivr: undefined,
                },
            })

            fireEvent.click(getByText('Add voice integration'))

            expect(updateOrCreateIntegration).toHaveBeenCalledWith(payload)
            expect(store.dispatch).toHaveBeenCalledTimes(1)
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
