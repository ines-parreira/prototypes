import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'

import {PhoneIntegrationEvent} from '../../../../../../constants/integrations/types/event'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import PhoneEventDetails from '../PhoneEventDetails'

describe('<PhoneEventDetails/>', () => {
    let store: MockStoreEnhanced
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    beforeEach(() => {
        store = mockStore()
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

        it('should render call recording event', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.CallRecording,
                data: {
                    recording: {
                        file: {
                            url:
                                'https://uploads.gorgi.us/development/some-file.mp3',
                            name: 'phone-123ABC.mp3',
                            size: 17763,
                            content_type: 'audio/mpeg',
                        },
                        original: {
                            sid: '123ABC',
                            url:
                                'https://api.twilio.com/2010-04-01/Accounts/123/Recordings/ABC',
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
