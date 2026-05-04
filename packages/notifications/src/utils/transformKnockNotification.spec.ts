import type { FeedItem } from '@knocklabs/client'

import type { RawNotification } from '../types'
import { transformKnockNotification } from './transformKnockNotification'

const makeItem = (
    overrides: Partial<FeedItem<RawNotification>> = {},
): FeedItem<RawNotification> =>
    ({
        id: 'item-1',
        inserted_at: '2024-01-01T12:00:00Z',
        read_at: null,
        seen_at: null,
        data: {
            type: 'ticket-message.created',
            payload: { ticketId: 42 },
        } as unknown as RawNotification,
        ...overrides,
    }) as FeedItem<RawNotification>

describe('transformKnockNotification', () => {
    it('returns null when data is null', () => {
        const item = makeItem({ data: null })
        expect(transformKnockNotification(item)).toBeNull()
    })

    it('maps inserted_at to inserted_datetime', () => {
        const item = makeItem({ inserted_at: '2024-06-15T09:30:00Z' })
        const result = transformKnockNotification(item)
        expect(result?.inserted_datetime).toBe('2024-06-15T09:30:00Z')
    })

    it('maps read_at to read_datetime', () => {
        const item = makeItem({ read_at: '2024-06-15T10:00:00Z' })
        const result = transformKnockNotification(item)
        expect(result?.read_datetime).toBe('2024-06-15T10:00:00Z')
    })

    it('sets read_datetime to null when read_at is null', () => {
        const item = makeItem({ read_at: null })
        const result = transformKnockNotification(item)
        expect(result?.read_datetime).toBeNull()
    })

    it('maps seen_at to seen_datetime', () => {
        const item = makeItem({ seen_at: '2024-06-15T11:00:00Z' })
        const result = transformKnockNotification(item)
        expect(result?.seen_datetime).toBe('2024-06-15T11:00:00Z')
    })

    it('preserves the id from the feed item', () => {
        const item = makeItem({ id: 'notification-abc-123' })
        const result = transformKnockNotification(item)
        expect(result?.id).toBe('notification-abc-123')
    })

    it('spreads all data fields into the result', () => {
        const data = {
            type: 'user.mentioned',
            payload: { ticketId: 99 },
        } as unknown as RawNotification
        const item = makeItem({ data })
        const result = transformKnockNotification(item)
        expect(result?.type).toBe('user.mentioned')
        expect(result?.payload).toEqual({ ticketId: 99 })
    })
})
