import {useEffect, useState} from 'react'

import {ModalManager} from './Manager'

import {
    ModalParams,
    useModalManagerApi,
    Event,
    CallbackFunction,
} from './typings'

const createUndefinedModalError = (methodName: string) =>
    new Error(
        `You must provide modal name in 'useModalManage' otherwise in method '${methodName}'`
    )

/**
 * @description
 *    Attach element to modal in modal manager
 *  and get methods for open/close modals.
 *  name is not required,  you can use this hook
 *  only for access to methods without subscription.
 *
 * @param {Manager} manager
 * @param {string?} name name of modal
 */
export const useModalManager = (
    manager: ModalManager,
    name?: string
): useModalManagerApi => {
    const _name = name
    const [, update] = useState(0)

    useEffect(() => {
        //  In oder to trigger an update inside React lifecycle
        // we need to create a stub subscriber that will be called
        // when the modal is opened or closed.
        const subscriberTicker = () => {
            update(Math.random())
        }
        if (name) {
            manager.addModal(name)
            manager.addSubscriber(name, subscriberTicker)
        }
        return () => {
            if (name) {
                // `removeModal` removes the subscribers as well
                // but better to do it manually.
                manager.removeSubscriber(name, subscriberTicker)
                manager.removeModal(name)
            }
        }
    }, [name])

    return {
        openModal: (
            name: string | undefined = _name,
            closeOther?: boolean,
            params?: ModalParams
        ) => {
            if (!name) throw createUndefinedModalError('openModal')
            return manager.openModal(name, closeOther, params)
        },
        closeModal: (name: string | undefined = _name) => {
            if (!name) throw createUndefinedModalError('closeModal')
            return manager.closeModal(name)
        },
        isOpen: (name: string | undefined = _name) => {
            if (!name) throw createUndefinedModalError('isOpen')
            return manager.isOpen(name)
        },
        getParams: (name: string | undefined = _name) => {
            if (!name) throw createUndefinedModalError('getParams')
            return manager.getParams(name)
        },
        on: (name: string, event: Event, cb: CallbackFunction) => {
            if (!name) throw createUndefinedModalError('getParams')
            return manager.on(event, (currentModalName, params) => {
                if (currentModalName === name) {
                    return cb(currentModalName, params)
                }
            })
        },
    }
}
