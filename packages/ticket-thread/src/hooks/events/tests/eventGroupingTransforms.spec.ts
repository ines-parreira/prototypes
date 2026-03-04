import { TicketThreadItemTag } from '../../types'
import type { TicketThreadItem } from '../../types'
import { groupConsecutiveEvents } from '../transforms'

describe('groupConsecutiveEvents', () => {
    const firstEvent = {
        _tag: TicketThreadItemTag.Events.TicketEvent,
        datetime: '2024-03-21T11:00:00Z',
        data: { id: 1 },
    } as const
    const secondEvent = {
        _tag: TicketThreadItemTag.Events.PhoneEvent,
        datetime: '2024-03-21T11:01:00Z',
        data: { id: 2 },
    } as const
    const thirdEvent = {
        _tag: TicketThreadItemTag.Events.PrivateReplyEvent,
        datetime: '2024-03-21T11:02:00Z',
        data: { id: 3 },
    } as const
    const nonEventItem = {
        _tag: TicketThreadItemTag.Messages.Message,
        datetime: '2024-03-21T11:01:30Z',
        data: { id: 10 },
    } as const

    it('merges consecutive events into one merged event item', () => {
        const items = [
            firstEvent,
            secondEvent,
            thirdEvent,
        ] as unknown as TicketThreadItem[]

        expect(groupConsecutiveEvents(items)).toEqual([
            {
                _tag: TicketThreadItemTag.Events.GroupedEvents,
                data: [firstEvent, secondEvent, thirdEvent],
                datetime: firstEvent.datetime,
            },
        ])
    })

    it('keeps isolated events ungrouped', () => {
        const items = [firstEvent] as unknown as TicketThreadItem[]

        expect(groupConsecutiveEvents(items)).toEqual([firstEvent])
    })

    it('breaks event groups when a non-event item appears between them', () => {
        const items = [
            firstEvent,
            nonEventItem,
            secondEvent,
        ] as unknown as TicketThreadItem[]

        expect(groupConsecutiveEvents(items)).toEqual([
            firstEvent,
            nonEventItem,
            secondEvent,
        ])
    })
})
