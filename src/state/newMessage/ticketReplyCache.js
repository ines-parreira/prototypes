// @flow
import {fromJS} from 'immutable'

import type {Map} from 'immutable'

const CACHE_KEY_SEPARATOR = '~'
const CACHE_KEY_PREFIX = `G${CACHE_KEY_SEPARATOR}`
export const CACHE_MAX_ITEMS = 5

export const defaultTicket = fromJS({
    contentState: null,
    selectionState: null,
    macro: null,
    sourceType: null,
})

export class TicketReplyCache {
    // flow considers classes read-only
    // https://github.com/facebook/flow/issues/1517
    storage: window.localStorage

    constructor(storage: Storage = window.localStorage) {
        this.storage = storage
    }

    /**
     * Get all our cached keys
     * @returns {Array}
     * @private
     */
    _keys(): Array<string> {
        const keys = []
        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i)

            if (key.startsWith(CACHE_KEY_PREFIX)) {
                keys.push(key)
            }
        }
        return keys
    }

    /**
     * Return the id of our key
     *
     * @param key
     * @returns {*}
     * @private
     */
    _id(key: string): string {
        return key.split(CACHE_KEY_SEPARATOR)[1]
    }

    /**
     * Get timestamp given a key
     *
     * @param key
     * @returns {Number}
     * @private
     */
    _timestamp(key: string): number {
        return parseInt(key.split(CACHE_KEY_SEPARATOR)[2])
    }

    /**
     * Remove the oldest item in the cache
     *
     * @private
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
     *
     * @param key
     * @private
     */
    _deleteByKey(key: string) {
        try {
            this.storage.removeItem(key)
        } catch (err) {
            console.error('Failed to remove item from local storage')
        }
    }

    /**
     * Delete an individual item based on it's id
     *
     * @param id
     * @param keys
     * @private
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
     *
     * @param ticketId
     * @param ticketDetails
     */
    set(ticketId: string = 'new', ticketDetails: {}) {
        // always use strings for ids
        const id = String(ticketId)
        const timestamp = (new Date()).getTime()

        // don't save cache for new tickets
        if (id === 'new') {
            return
        }

        const cacheKeys = this._keys()
        if (cacheKeys.length >= CACHE_MAX_ITEMS) {
            this._evict(cacheKeys)
        }

        let ticket = this.get(id, cacheKeys)
        if (ticket && !ticket.equals(defaultTicket)) {
            // merge existing details
            ticket = ticket.merge(fromJS(ticketDetails))
            // And delete the old key
            this._deleteById(id, cacheKeys)
        } else {
            ticket = fromJS(ticketDetails)
        }

        // save in storage
        try {
            this.storage.setItem(`${CACHE_KEY_PREFIX}${id}${CACHE_KEY_SEPARATOR}${timestamp}`,
                JSON.stringify(ticket.toJS()))
        } catch (err) {
            console.error('Failed to save new state in local storage', err)
        }
    }

    get(ticketId: string = 'new', keys: ?Array<string>): Map<*,*> {
        const id = String(ticketId)
        if (id === 'new') {
            return defaultTicket
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
                    return fromJS(JSON.parse(this.storage.getItem(key)))
                } catch (err) {
                    console.error('Failed to fetch item from local storage')
                    return defaultTicket
                }
            }
        }
        return defaultTicket
    }

    delete(ticketId: string = 'new') {
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

export default new TicketReplyCache()
