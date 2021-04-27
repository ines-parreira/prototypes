import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'

import {PhoneIntegrationEvent} from '../../../../../../constants/integrations/types/event'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import PhoneEvent from '../PhoneEvent'

describe('<PhoneEvent/>', () => {
    let store: MockStoreEnhanced
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    beforeEach(() => {
        store = mockStore()
    })

    describe('render()', () => {
        it.each(Object.values(PhoneIntegrationEvent))(
            'should render with closed details',
            (eventType) => {
                const event = fromJS({
                    type: eventType,
                    customer: {name: 'Michael Gorgias'},
                })
                const {container} = render(
                    <Provider store={store}>
                        <PhoneEvent event={event} isLast={false} />
                    </Provider>
                )

                expect(container.firstChild).toMatchSnapshot()
            }
        )
        it.each([
            PhoneIntegrationEvent.VoicemailRecording,
            PhoneIntegrationEvent.IncomingPhoneCall,
            PhoneIntegrationEvent.CompletedPhoneCall,
        ])('should render with opened details', (eventType) => {
            const event = fromJS({
                type: eventType,
                data: {
                    customer: {
                        name: 'Michael Gorgias',
                        phone_number: '+16624424075',
                    },
                },
            })
            const {container, getByText} = render(
                <Provider store={store}>
                    <PhoneEvent event={event} isLast={false} />
                </Provider>
            )
            getByText('keyboard_arrow_down').click()

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
