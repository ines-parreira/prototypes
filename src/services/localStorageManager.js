// @flow

import {SHOPIFY_INTEGRATION_TYPE} from '../constants/integration'

type Key = number | string

class LocalStorageManager {
    integrations = {
        [SHOPIFY_INTEGRATION_TYPE]: {
            draftOrders: {
                _key: 'infobar/actions/shopify/draft-orders',
                getMap() {
                    return LocalStorageManager._getMap(this._key)
                },
                setMapItem(key: Key, value: string) {
                    LocalStorageManager._setMapItem(this._key, key, value)
                },
                deleteMapItem(key: Key) {
                    LocalStorageManager._deleteMapItem(this._key, key)
                },
            },
        },
    }

    static _getMap(key: Key): Map<Key, any> {
        const rawData = window.localStorage.getItem(key)
        const entries = rawData ? JSON.parse(rawData) : []

        return new Map(entries)
    }

    static _setMap(key: Key, map: Map<Key, any>) {
        const newValue = JSON.stringify(Array.from(map.entries()))
        window.localStorage.setItem(key, newValue)
    }

    static _setMapItem(key: string, mapKey: Key, value: any) {
        const map = LocalStorageManager._getMap(key)
        map.set(mapKey, value)
        LocalStorageManager._setMap(key, map)
    }

    static _deleteMapItem(key: string, mapKey: Key) {
        const map = LocalStorageManager._getMap(key)
        map.delete(mapKey)
        LocalStorageManager._setMap(key, map)
    }
}

const localStorageManager = new LocalStorageManager()

export default localStorageManager
