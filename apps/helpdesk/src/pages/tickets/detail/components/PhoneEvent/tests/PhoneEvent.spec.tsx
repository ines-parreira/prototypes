import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store'
import thunk from 'redux-thunk'

import { PhoneIntegrationEvent } from 'constants/integrations/types/event'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

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
            PhoneIntegrationEvent.MessagePlayed,
        ])('should render with closed details', (eventType) => {
            const event = fromJS({
                type: eventType,
                customer: { name: 'Michael Gorgias' },
            })
            const { getByText } = renderWithRouter(
                <Provider store={store}>
                    <PhoneEvent event={event} isLast={false} />
                </Provider>,
            )

            expect(getByText('keyboard_arrow_down')).toBeInTheDocument()
        })

        it('should render with "View ticket" link"', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.ConversationStarted,
                data: { phone_ticket_id: 123 },
            })
            const { getByText } = renderWithRouter(
                <Provider store={store}>
                    <PhoneEvent event={event} isLast={false} />
                </Provider>,
            )

            expect(getByText('View ticket')).toBeInTheDocument()
        })

        it('should render agent based event', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.ConversationStarted,
                user: { name: 'Agent' },
                data: {
                    customer: { name: 'Customer' },
                },
            })
            const { getByText } = renderWithRouter(
                <Provider store={store}>
                    <PhoneEvent event={event} isLast={false} />
                </Provider>,
            )

            expect(
                getByText('Phone conversation started by Agent'),
            ).toBeInTheDocument()
        })
    })
})
