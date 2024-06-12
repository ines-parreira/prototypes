import {Event, EventObjectType, EventType} from 'models/event/types'
import {getAuditLogEvents} from 'state/entities/auditLogEvents/selectors'
import {RootState} from 'state/types'

describe('getAuditLogEvents', () => {
    it('should return AuditLogEvents array', () => {
        const event: Event = {
            id: 123,
            context: 'string',
            created_datetime: 'string',
            data: null,
            object_id: 123,
            object_type: EventObjectType.Tag,
            type: EventType.AccountCreated,
            user_id: 456,
            uri: '/string/sdaf',
        }
        const state = {
            entities: {
                auditLogEvents: {
                    someKEy: event,
                },
            },
        } as unknown as RootState

        expect(getAuditLogEvents(state)).toContainEqual(event)
    })
})
