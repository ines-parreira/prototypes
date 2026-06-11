import { render } from '@repo/testing'
import { fromJS } from 'immutable'

import { PhoneIntegrationEvent } from 'constants/integrations/types/event'

import { PhoneEvent } from '../PhoneEvent'

describe('<PhoneEvent/>', () => {
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
            const { getByText } = render(
                <PhoneEvent event={event} isLast={false} />,
            )

            expect(getByText('keyboard_arrow_down')).toBeInTheDocument()
        })

        it('should render with "View ticket" link"', () => {
            const event = fromJS({
                type: PhoneIntegrationEvent.ConversationStarted,
                data: { phone_ticket_id: 123 },
            })
            const { getByText } = render(
                <PhoneEvent event={event} isLast={false} />,
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
            const { getByText } = render(
                <PhoneEvent event={event} isLast={false} />,
            )

            expect(
                getByText('Phone conversation started by Agent'),
            ).toBeInTheDocument()
        })
    })
})
