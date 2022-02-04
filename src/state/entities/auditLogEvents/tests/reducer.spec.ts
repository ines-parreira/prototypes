import {auditLogEventsFetched} from '../actions'
import reducer from '../reducer'

import {events as eventsFixtures} from '../../../../fixtures/event'
import {AuditLogEventsState} from '../types'

describe('audit log events reducer', () => {
    describe('fetchEvents action', () => {
        const initialState: AuditLogEventsState = {}

        it('should add the events to the state', () => {
            const newState = reducer(
                initialState,
                auditLogEventsFetched(eventsFixtures)
            )
            expect(newState).toMatchSnapshot()
        })
    })
})
