import {useEffect} from 'react'

export interface ElementListener {
    addEventListener(
        name: string,
        handler: (event?: any) => void,
        ...args: any[]
    ): void

    removeEventListener(
        name: string,
        handler: (event?: any) => void,
        ...args: any[]
    ): void
}

export interface OnOffListener {
    on(name: string, handler: (event?: any) => void, ...args: any[]): void

    off(name: string, handler: (event?: any) => void, ...args: any[]): void
}

type UseEventTarget = ElementListener | OnOffListener

const defaultTarget = window

const isElementListener = (target: any): target is ElementListener => {
    return 'addEventListener' in target
}
const isOnOffListener = (target: any): target is OnOffListener => {
    return 'on' in target
}

type AddEventListener<T> = T extends ElementListener
    ? T['addEventListener']
    : T extends OnOffListener
    ? T['on']
    : never

type UseEventOptions<T> = Parameters<AddEventListener<T>>[2]

export default function useEvent<T extends UseEventTarget>(
    name: Parameters<AddEventListener<T>>[0],
    handler?: null | undefined | Parameters<AddEventListener<T>>[1],
    target: null | T | Window = defaultTarget,
    options?: UseEventOptions<T>
) {
    useEffect(() => {
        if (!handler) {
            return
        }
        if (!target) {
            return
        }

        if (isElementListener(target)) {
            target.addEventListener(name, handler, options)
        } else if (isOnOffListener(target)) {
            target.on(name, handler, options)
        }
        return () => {
            if (isElementListener(target)) {
                target.removeEventListener(name, handler, options)
            } else if (isOnOffListener(target)) {
                target.off(name, handler, options)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, handler, target, JSON.stringify(options)])
}
