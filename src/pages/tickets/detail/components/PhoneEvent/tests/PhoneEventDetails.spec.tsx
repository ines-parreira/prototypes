import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'

import {Account} from 'state/currentAccount/types'
import {PhoneIntegrationEvent} from 'constants/integrations/types/event'
import {RootState, StoreDispatch} from 'state/types'
import {user} from 'fixtures/users'

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
        it('should render voicemail event details', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.VoicemailRecording,
                data: {
                    call: {
                        recording_url:
                            'https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/RE6fac6a901e0b886cec366ceb6365a8cd-a358dc82-a84b-4975-baef-7852d7c9c180',
                        recording_duration: '6',
                    },
                    customer: {
                        id: 6,
                        name: null,
                        phone_number: '+16624424075',
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

        it('should render voicemail event details with message', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.VoicemailRecording,
                data: {
                    call: {
                        recording_url:
                            'https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/RE6fac6a901e0b886cec366ceb6365a8cd-a358dc82-a84b-4975-baef-7852d7c9c180',
                        recording_duration: '6',
                    },
                    customer: {
                        id: 6,
                        name: null,
                        phone_number: '+16624424075',
                    },
                    deleted_by: 'Michael',
                },
            })
            const {container} = render(
                <Provider store={store}>
                    <PhoneEventDetails event={event} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render voicemail event with warning when recording is not available', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.VoicemailRecording,
                data: {
                    call: {
                        recording_url:
                            'https://api.twilio.com/2010-04-01/Accounts/ACb44c.mp3',
                        recording_duration: '6',
                    },
                    customer: {
                        id: 6,
                        name: null,
                        phone_number: '+16624424075',
                    },
                    recording: {
                        file: {
                            url: 'https://api.twilio.com/2010-04-01/Accounts/ACb44c.mp3',
                            name: 'phone-RE717480a3e40211d8bdf62a952d23c47b.mp3',
                            size: null,
                            public: false,
                            content_type: 'application/octet-stream',
                        },
                        original: {
                            sid: 'RE717480a3e40211d8bdf62a952d23c47b',
                            url: 'https://api.twilio.com/2010-04-01/Accounts/ACb44c.mp3',
                            status: 'completed',
                            call_sid: 'CA5479a7d41118a92f8d7ffd4e6b151f0b',
                            duration: '3',
                            error_code: '0',
                            start_time: 'Tue, 11 Jul 2023 14:31:46 +0000',
                            account_sid: 'ACb44ce48d0a001e992e703911ee8feef0',
                        },
                        created_datetime: '2023-07-11T14:31:56.266177',
                    },
                },
            })
            const {container, getByText} = render(
                <Provider store={store}>
                    <PhoneEventDetails event={event} />
                </Provider>
            )

            expect(
                getByText('The voicemail recording is not available.')
            ).toBeInTheDocument()
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render completed call event details', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.CompletedPhoneCall,
                data: {
                    call: {
                        call_duration: '6',
                    },
                    customer: {
                        id: 6,
                        name: null,
                        phone_number: '+16624424075',
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

        it('should render call recording event', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.CallRecording,
                data: {
                    recording: {
                        file: {
                            url: 'https://uploads.gorgi.us/development/some-file.mp3',
                            name: 'phone-123ABC.mp3',
                            size: 17763,
                            content_type: 'audio/mpeg',
                        },
                        original: {
                            sid: '123ABC',
                            url: 'https://api.twilio.com/2010-04-01/Accounts/123/Recordings/ABC',
                            track: 'both',
                            status: 'completed',
                            call_sid: 'CAb8068b6d8cdc2112e42957f61d90f737',
                            duration: '5',
                            error_code: '0',
                            start_time: 'Tue, 27 Jul 2021 11:15:46 +0000',
                            account_sid: 'ABCCBA',
                        },
                        created_datetime: '2021-07-27T11:15:57.749720',
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

        it('should render call recording event with message', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.CallRecording,
                data: {
                    recording: {
                        file: {
                            url: 'https://uploads.gorgi.us/development/some-file.mp3',
                            name: 'phone-123ABC.mp3',
                            size: 17763,
                            content_type: 'audio/mpeg',
                        },
                        original: {
                            sid: '123ABC',
                            url: 'https://api.twilio.com/2010-04-01/Accounts/123/Recordings/ABC',
                            track: 'both',
                            status: 'completed',
                            call_sid: 'CAb8068b6d8cdc2112e42957f61d90f737',
                            duration: '5',
                            error_code: '0',
                            start_time: 'Tue, 27 Jul 2021 11:15:46 +0000',
                            account_sid: 'ABCCBA',
                        },
                        created_datetime: '2021-07-27T11:15:57.749720',
                    },
                    deleted_by: 'Michael',
                },
            })
            const {container} = render(
                <Provider store={store}>
                    <PhoneEventDetails event={event} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render call recording event with warning when recording is not available', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.CallRecording,
                data: {
                    recording: {
                        file: {
                            url: 'https://uploads.gorgi.us/development/some-file.mp3',
                            name: 'phone-123ABC.mp3',
                            size: 17763,
                            content_type: 'audio/mpeg',
                            public: false,
                        },
                        original: {
                            sid: '123ABC',
                            url: 'https://api.twilio.com/2010-04-01/Accounts/123/Recordings/ABC',
                            track: 'both',
                            status: 'completed',
                            call_sid: 'CAb8068b6d8cdc2112e42957f61d90f737',
                            duration: '5',
                            error_code: '0',
                            start_time: 'Tue, 27 Jul 2021 11:15:46 +0000',
                            account_sid: 'ABCCBA',
                        },
                    },
                },
            })
            const {container, getByText} = render(
                <Provider store={store}>
                    <PhoneEventDetails event={event} />
                </Provider>
            )

            expect(
                getByText('The call recording is not available.')
            ).toBeInTheDocument()
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render details for answered phone call event', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.PhoneCallAnswered,
                data: {
                    customer: {
                        name: null,
                        phone_number: '+16624424075',
                    },
                    forwarded_to: '+166324002433',
                },
            })
            const {container} = render(
                <Provider store={store}>
                    <PhoneEventDetails event={event} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it.each([
            PhoneIntegrationEvent.OutgoingPhoneCall,
            PhoneIntegrationEvent.IncomingPhoneCall,
        ])('should render details for the rest of events', (eventType) => {
            const event = fromJS({
                type: eventType,
                data: {
                    customer: {
                        name: null,
                        phone_number: '+16624424075',
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
