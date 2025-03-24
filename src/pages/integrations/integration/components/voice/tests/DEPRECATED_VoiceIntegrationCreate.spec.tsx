import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { phoneNumbers } from 'fixtures/newPhoneNumber'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import { RootState, StoreDispatch } from 'state/types'

import DEPRECATED_VoiceIntegrationCreate from '../DEPRECATED_VoiceIntegrationCreate'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {
        newPhoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({ ...acc, [number.id]: number }),
            {},
        ),
    },
} as RootState)

store.dispatch = jest.fn()
jest.mock('state/integrations/actions', () => ({
    updateOrCreateIntegration: jest.fn(),
}))
const submittedPayload = {
    type: 'phone',
    name: 'My Voice integration',
    meta: {
        emoji: null,
        function: 'standard',
        phone_number_id: 1,
        preferences: {
            record_inbound_calls: false,
            voicemail_outside_business_hours: true,
            record_outbound_calls: false,
            transcribe: {
                recordings: false,
                voicemails: false,
            },
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
}

describe('<DEPRECATED_VoiceIntegrationCreate/>', () => {
    describe('render()', () => {
        it('should render', () => {
            render(
                <Provider store={store}>
                    <DEPRECATED_VoiceIntegrationCreate
                        selectedPhoneNumberId={1}
                    />
                </Provider>,
            )

            expect(screen.getByText('Integration title')).toBeInTheDocument()
        })

        it('should submit a valid payload with the selected phone_number_id', () => {
            const { getByText, getByLabelText } = render(
                <Provider store={store}>
                    <DEPRECATED_VoiceIntegrationCreate
                        selectedPhoneNumberId={1}
                    />
                </Provider>,
            )

            fireEvent.change(getByLabelText('Integration title'), {
                target: { value: 'My Voice integration' },
            })

            fireEvent.click(getByText('Add Voice'))

            expect(updateOrCreateIntegration).toHaveBeenCalledWith(
                fromJS(submittedPayload),
            )
            expect(store.dispatch).toHaveBeenCalledTimes(1)
        })

        it('should submit a valid payload', () => {
            const { getByText, getByLabelText } = render(
                <Provider store={store}>
                    <DEPRECATED_VoiceIntegrationCreate
                        selectedPhoneNumberId={1}
                    />
                </Provider>,
            )

            fireEvent.change(getByLabelText('Integration title'), {
                target: { value: 'My Voice integration' },
            })

            fireEvent.click(getByText('Add Voice'))

            expect(updateOrCreateIntegration).toHaveBeenCalledWith(
                fromJS(submittedPayload),
            )
            expect(store.dispatch).toHaveBeenCalledTimes(1)
        })

        it("should prefill the title field using the phone number's name", () => {
            const { getByText } = render(
                <Provider store={store}>
                    <DEPRECATED_VoiceIntegrationCreate
                        selectedPhoneNumberId={1}
                    />
                </Provider>,
            )

            fireEvent.click(getByText('Add Voice'))

            expect(updateOrCreateIntegration).toHaveBeenCalledWith(
                fromJS({ ...submittedPayload, name: 'A Phone Number - Voice' }),
            )
            expect(store.dispatch).toHaveBeenCalledTimes(1)
        })
    })
})
