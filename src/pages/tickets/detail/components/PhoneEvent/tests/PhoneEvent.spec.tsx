import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'

import {PhoneIntegrationEvent} from 'constants/integrations/types/event'
import {RootState, StoreDispatch} from 'state/types'
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
        it.each([
            PhoneIntegrationEvent.PhoneCallForwardedToExternalNumber,
            PhoneIntegrationEvent.PhoneCallForwardedToGorgiasNumber,
            PhoneIntegrationEvent.PhoneCallForwarded,
            PhoneIntegrationEvent.MessagePlayed,
        ])('should render with closed details', (eventType) => {
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
        })

        it('should render with "View ticket" link"', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.ConversationStarted,
                data: {phone_ticket_id: 123},
            })
            const {container} = render(
                <Provider store={store}>
                    <PhoneEvent event={event} isLast={false} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
