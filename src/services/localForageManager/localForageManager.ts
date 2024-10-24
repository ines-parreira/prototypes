import localForage from 'localforage'
import {extendPrototype as extendGetItemsPrototype} from 'localforage-getitems'
import {extendPrototype as extendObservablePrototype} from 'localforage-observable'
import {extendPrototype as extendRemoveItemsPrototype} from 'localforage-removeitems'
import Observable from 'zen-observable'

const localforage = extendObservablePrototype(localForage)

localforage.newObservable.factory = (subscribeFn) => {
    return new Observable(({next, error, complete}) => {
        subscribeFn({
            next,
            error,
            complete,
        })
    })
}

extendGetItemsPrototype(localforage)
extendRemoveItemsPrototype(localforage)

class LocalForageManager {
    instance: LocalForage
    tables: Record<string, LocalForage> = {}

    constructor() {
        this.instance = localforage.createInstance({
            name: 'Gorgias',
        })
    }

    private createStore = (name: string) => {
        this.tables[name] = localforage.createInstance({
            name: 'Gorgias',
            storeName: name,
        })
    }

    getTable = (name: string) => {
        if (!this.tables[name]) {
            this.createStore(name)
        }
        return this.tables[name]
    }

    observeTable = (name: string, callback: () => void | Promise<void>) => {
        if (!this.tables[name]) {
            this.createStore(name)
        }
        this.tables[name].configObservables({crossTabNotification: true})
        const observable = this.tables[name].newObservable({
            crossTabNotification: true,
        })
        const subscription = observable.subscribe({
            next: function (change) {
                if (change.valueChange) {
                    void callback()
                }
            },
            error: function (err) {
                throw err
            },
        })
        return subscription
    }

    clearTable = (name: string) => {
        void this.tables[name]?.clear()
    }
}

export default new LocalForageManager()
