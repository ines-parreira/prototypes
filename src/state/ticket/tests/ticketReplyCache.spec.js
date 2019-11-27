import {fromJS} from 'immutable'

import {TicketReplyCache, defaultTicket, CACHE_MAX_ITEMS} from '../../newMessage/ticketReplyCache'

// Storage Mock
const storageMock = () => {
    const storage = {}

    return {
        setItem: (key, value) => {
            storage[key] = value || ''
        },
        getItem: (key) => {
            return storage[key] || null
        },
        removeItem: (key) => {
            delete storage[key]
        },
        get length() {
            return Object.keys(storage).length
        },
        key: (i) => {
            const keys = Object.keys(storage)
            return keys[i] || null
        }
    }
}

describe('ticketReplyCache', () => {
    let storage
    let cache

    beforeEach(() => {
        storage = storageMock()
        cache = new TicketReplyCache(storage)
    })

    it('should set/get item', () => {
        const data = {a: 1}
        const key = 123

        cache.set(key, data)
        expect(cache.get(key)).toEqual(fromJS(data))
        expect(storage.length).toEqual(1)
    })

    it('should get default item if does not exist', () => {
        expect(cache.get('does not exist')).toEqual(defaultTicket)
        expect(storage.length).toEqual(0)
    })

    it('should evict older items', () => {
        for (let i = 0; i < CACHE_MAX_ITEMS + 10; i++) {
            cache.set(i, {a: 1})
        }
        // should stay the same length
        expect(storage.length).toEqual(CACHE_MAX_ITEMS)
    })

    it('should keep a single entry for an id', () => {
        cache.set(1, {a: 1})
        cache.set(1, {a: 2})
        cache.set(1, {a: 3})

        // should stay the same length
        expect(cache.get(1)).toEqual(fromJS({a: 3}))
        expect(storage.length).toEqual(1)
    })
})
