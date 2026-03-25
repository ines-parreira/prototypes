import { tryLocalStorage } from '@repo/browser-storage'
import type { RawDraftContentState, SelectionState } from 'draft-js'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import type { DiscountCode } from 'models/discountCodes/types'

export interface TopRankMacroState {
    state: 'accepted' | 'pending' | 'rejected'
    macroId: number
}

const CACHE_KEY_SEPARATOR = '~'
const CACHE_KEY_PREFIX = `G${CACHE_KEY_SEPARATOR}`
export const CACHE_MAX_ITEMS = 30

export type RawCachedTicket = {
    contentState: RawDraftContentState | null
    selectionState: SelectionState | null
    macro: Map<any, any> | null
    sourceType: string | null
    emailExtraAdded: boolean
    topRankMacroState?: TopRankMacroState | null
    inserted_discounts?: DiscountCode[] | null
    originalContentState?: RawDraftContentState | null
}

const defaultRawCachedTicket: RawCachedTicket = {
    contentState: null,
    selectionState: null,
    macro: null,
    sourceType: null,
    emailExtraAdded: false,
    topRankMacroState: null,
    inserted_discounts: null,
    originalContentState: null,
}

const defaultCachedTicket: Map<any, any> = fromJS(defaultRawCachedTicket)

export class TicketReplyCache {
    // flow considers classes read-only
    // https://github.com/facebook/flow/issues/1517
    storage: Storage

    constructor(storage: Storage = window.localStorage) {
        this.storage = storage
    }

    /**
     * Get all our cached keys
     */
    _keys(): Array<string> {
        const keys = []
        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i) || ''

            if (key.startsWith(CACHE_KEY_PREFIX)) {
                keys.push(key)
            }
        }
        return keys
    }

    /**
     * Return the id of our key
     */
    _id(key: string): string {
        return key.split(CACHE_KEY_SEPARATOR)[1]
    }

    /**
     * Get timestamp given a key
     */
    _timestamp(key: string): number {
        return parseInt(key.split(CACHE_KEY_SEPARATOR)[2])
    }

    /**
     * Remove the oldest item in the cache
     */
    _evict(cacheKeys: Array<string>) {
        // We've reached the maximum storage so we'll have to remove the oldest item from storage
        let oldestKey = cacheKeys[0]
        for (const key of cacheKeys.slice(1)) {
            if (this._timestamp(oldestKey) > this._timestamp(key)) {
                oldestKey = key
            }
        }
        this._deleteByKey(oldestKey)
    }

    /**
     * Delete an individual item from the storage
     */
    _deleteByKey(key: string) {
        try {
            this.storage.removeItem(key)
        } catch {
            console.error('Failed to remove item from local storage')
        }
    }

    /**
     * Delete an individual item based on it's id
     */
    _deleteById(id: string, keys: Array<string>) {
        for (const key of keys) {
            if (this._id(key) === id) {
                this._deleteByKey(key)
                return
            }
        }
    }

    /**
     * Set a value for a given key
     */
    set(
        ticketId = 'new',
        ticketDetails: Partial<RawCachedTicket> | Map<string, unknown>,
    ) {
        // always use strings for ids
        const id = String(ticketId)
        const timestamp = new Date().getTime()

        // don't save cache for new tickets
        if (id === 'new') {
            return
        }

        const cacheKeys = this._keys()
        if (cacheKeys.length >= CACHE_MAX_ITEMS) {
            this._evict(cacheKeys)
        }

        let ticket = this.get(id, cacheKeys)
        if (ticket && !ticket.equals(defaultCachedTicket)) {
            // merge existing details
            ticket = ticket.merge(fromJS(ticketDetails))
            // And delete the old key
            this._deleteById(id, cacheKeys)
        } else {
            ticket = fromJS(ticketDetails)
        }

        tryLocalStorage(() => {
            this.storage.setItem(
                `${CACHE_KEY_PREFIX}${id}${CACHE_KEY_SEPARATOR}${timestamp}`,
                JSON.stringify(ticket.toJS()),
            )
        })
    }

    get(ticketId = 'new', keys?: Maybe<Array<string>>): Map<any, any> {
        const id = String(ticketId)
        if (id === 'new') {
            return defaultCachedTicket
        }

        let cacheKeys = []
        if (keys) {
            cacheKeys = keys
        } else {
            cacheKeys = this._keys()
        }

        for (const key of cacheKeys) {
            if (this._id(key) === id) {
                try {
                    return fromJS(
                        JSON.parse(this.storage.getItem(key) || ''),
                    ) as Map<any, any>
                } catch {
                    console.error('Failed to fetch item from local storage')
                    return defaultCachedTicket
                }
            }
        }
        return defaultCachedTicket
    }

    delete(ticketId = 'new') {
        const id = String(ticketId)
        if (id === 'new') {
            return
        }

        for (const key of this._keys()) {
            if (this._id(key) === id) {
                this._deleteByKey(key)
            }
        }
    }
}

const ticketReplyCache = new TicketReplyCache()

export default ticketReplyCache
