import {fromJS} from 'immutable'

import {TicketReplyCache, CACHE_MAX_ITEMS} from '../ticketReplyCache'
import {TicketMessageSourceType} from '../../../business/types/ticket'

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
        const data = {sourceType: TicketMessageSourceType.Email}
        const key = '123'

        cache.set(key, data)
        expect(cache.get(key)).toEqual(fromJS(data))
        expect(storage).toHaveLength(1)
    })

    it('should get default item if does not exist', () => {
        expect(storage).toHaveLength(0)
        expect(cache.get('does not exist')).toMatchSnapshot()
    })

    it('should evict older items', () => {
        for (let i = 0; i < CACHE_MAX_ITEMS + 10; i++) {
            cache.set(i.toString(), {sourceType: TicketMessageSourceType.Email})
        }
        // should stay the same length
        expect(storage).toHaveLength(CACHE_MAX_ITEMS)
    })

    it('should keep a single entry for an id', () => {
        cache.set('1', {sourceType: TicketMessageSourceType.Email})
        cache.set('1', {sourceType: TicketMessageSourceType.Aircall})
        cache.set('1', {sourceType: TicketMessageSourceType.Facebook})

        // should stay the same length
        expect(cache.get('1')).toEqual(
            fromJS({sourceType: TicketMessageSourceType.Facebook})
        )
        expect(storage).toHaveLength(1)
    })
})
