// @flow

import {SHOPIFY_INTEGRATION_TYPE} from '../constants/integration'

class LocalStorageManager {
    integrations = {
        [SHOPIFY_INTEGRATION_TYPE]: {
            draftOrders: {
                _key: 'infobar/actions/shopify/duplicate-order/draft-order-ids',
                getList() {
                    return LocalStorageManager._getList(this._key)
                },
                setList(values: Iterable<number>) {
                    LocalStorageManager._setList(this._key, values)
                },
                addListItem(value: number) {
                    LocalStorageManager._addListItem(this._key, value)
                },
                removeListItem(value: number) {
                    LocalStorageManager._removeListItem(this._key, value)
                }
            },
        },
    }

    static _getList(key: string): Set<any> {
        const value = window.localStorage.getItem(key)
        return new Set(value ? JSON.parse(value) : [])
    }

    static _setList(key: string, values: Iterable<any>) {
        const newValue = JSON.stringify(Array.from(values))
        window.localStorage.setItem(key, newValue)
    }

    static _addListItem(key: string, value: any) {
        const values = LocalStorageManager._getList(key)
        values.add(value)
        LocalStorageManager._setList(key, values)
    }

    static _removeListItem(key: string, value: any) {
        const values = LocalStorageManager._getList(key)
        values.delete(value)
        LocalStorageManager._setList(key, values)
    }
}

const localStorageManager = new LocalStorageManager()

export default localStorageManager
