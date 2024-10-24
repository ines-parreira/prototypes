import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'

import {PhoneIntegrationEvent} from 'constants/integrations/types/event'
import {user} from 'fixtures/users'
import {Account} from 'state/currentAccount/types'
import {RootState, StoreDispatch} from 'state/types'

import PhoneEventDetails from '../PhoneEventDetails'

describe('<PhoneEventDetails/>', () => {
    let store: MockStoreEnhanced
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    const realDateNow = Date.now
    beforeEach(() => {
        store = mockStore({currentUser: fromJS(user)})
        Date.now = jest.fn(() => 42)
        window.GORGIAS_STATE.currentAccount = {
            domain: 'acme',
        } as Account
    })
    afterAll(() => {
        Date.now = realDateNow
    })

    describe('render()', () => {
        it('should render call forwarded to external number event details', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.PhoneCallForwardedToExternalNumber,
                data: {
                    call: {
                        selected_menu_option: {
                            forward_call: {
                                phone_number: '+14567654985',
                            },
                        },
                    },
                },
            })
            const {container} = render(
                <Provider store={store}>
                    <PhoneEventDetails event={event} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render call forwarded to gorgias number event details', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.PhoneCallForwardedToGorgiasNumber,
                data: {
                    call: {
                        selected_menu_option: {
                            forward_call: {
                                phone_number: '+14567654985',
                            },
                        },
                    },
                },
            })
            const {container} = render(
                <Provider store={store}>
                    <PhoneEventDetails event={event} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render audio recording message played event details', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.MessagePlayed,
                data: {
                    call: {
                        selected_menu_option: {
                            voice_message: {
                                voice_message_type: 'voice_recording',
                                new_voice_recording_file_name:
                                    'voice_recording.mp3',
                            },
                        },
                    },
                },
            })
            const {container} = render(
                <Provider store={store}>
                    <PhoneEventDetails event={event} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render text message played event details', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.MessagePlayed,
                data: {
                    call: {
                        selected_menu_option: {
                            voice_message: {
                                voice_message_type: 'text_to_speech',
                                text_to_speech_content:
                                    'Text to speech message to play',
                            },
                        },
                    },
                },
            })
            const {container} = render(
                <Provider store={store}>
                    <PhoneEventDetails event={event} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
