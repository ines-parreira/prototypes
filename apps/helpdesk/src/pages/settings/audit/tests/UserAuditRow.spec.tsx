import { render } from '@repo/testing'
import { fromJS } from 'immutable'

import { events } from 'fixtures/event'
import type { EventType } from 'models/event/types'
import { EventObjectType } from 'models/event/types'
import type { RootState } from 'state/types'

import { UserAuditRow } from '../UserAuditRow'

global.Math.random = () => 0.8
const defaultState: Partial<RootState> = {
    agents: fromJS({
        all: [
            { id: 1, name: 'agent 1', email: 'agent1@gorgias.com' },
            { id: 2, name: 'agent 2', email: 'agent2@gorgias.com' },
            { id: 3, name: '', email: 'agent3@gorgias.com' },
        ],
    }),
} as RootState
describe('<UserAuditRow/>', () => {
    it('should render with a user, event type and object type', () => {
        const { container } = render(<UserAuditRow eventItem={events[1]} />, {
            storeState: defaultState,
        })
        expect(container).toMatchSnapshot()
    })
    it('should not render user when no agents are in store', () => {
        const { container } = render(<UserAuditRow eventItem={events[1]} />, {
            storeState: { agents: fromJS({}) },
        })
        expect(container).toMatchSnapshot()
    })
    it.each([
        EventObjectType.Ticket,
        EventObjectType.Customer,
        EventObjectType.User,
    ])('should render with a link to %s object type', (objectType) => {
        const { container } = render(
            <UserAuditRow
                eventItem={{
                    ...events[0],
                    object_type: objectType,
                    type: '' as EventType,
                }}
            />,
            {
                storeState: defaultState,
            },
        )
        expect(container).toMatchSnapshot()
    })
    it('should fallback to user email when user has no name set', () => {
        const { container } = render(
            <UserAuditRow
                eventItem={{
                    ...events[0],
                    user_id: 3,
                }}
            />,
            {
                storeState: defaultState,
            },
        )
        expect(container).toMatchSnapshot()
    })
})
