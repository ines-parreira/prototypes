import {fromJS} from 'immutable'

import {
    TicketReplyCache,
    defaultTicket,
    CACHE_MAX_ITEMS,
} from '../ticketReplyCache'

// Storage Mock
const storageMock = () => {
    const storage: Record<string, unknown> = {}

    return {
        setItem: (key: string, value: unknown) => {
            storage[key] = value || ''
        },
        getItem: (key: string) => {
            return storage[key] || null
        },
        removeItem: (key: string) => {
            delete storage[key]
        },
        get length() {
            return Object.keys(storage).length
        },
        key: (i: number) => {
            const keys = Object.keys(storage)
            return keys[i] || null
        },
    } as Storage
}

describe('ticketReplyCache', () => {
    let storage: Storage
    let cache: TicketReplyCache

    beforeEach(() => {
        storage = storageMock()
        cache = new TicketReplyCache(storage)
    })

    it('should set/get item', () => {
        const data = {a: 1}
        const key = '123'

        cache.set(key, data)
        expect(cache.get(key)).toEqual(fromJS(data))
        expect(storage).toHaveLength(1)
    })

    it('should get default item if does not exist', () => {
        expect(cache.get('does not exist')).toEqual(defaultTicket)
        expect(storage).toHaveLength(0)
    })

    it('should evict older items', () => {
        for (let i = 0; i < CACHE_MAX_ITEMS + 10; i++) {
            cache.set(i.toString(), {a: 1})
        }
        // should stay the same length
        expect(storage).toHaveLength(CACHE_MAX_ITEMS)
    })

    it('should keep a single entry for an id', () => {
        cache.set('1', {a: 1})
        cache.set('1', {a: 2})
        cache.set('1', {a: 3})

        // should stay the same length
        expect(cache.get('1')).toEqual(fromJS({a: 3}))
        expect(storage).toHaveLength(1)
    })
})
