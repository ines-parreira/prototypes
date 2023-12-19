import {DependencyList, useMemo} from 'react'
import noop from 'lodash/noop'
import useEvent, {UseEventOptions, UseEventTarget} from './useEvent'

type KeyPredicate = (event: KeyboardEvent) => boolean
type KeyFilter = null | undefined | string | ((event: KeyboardEvent) => boolean)
type Handler = (event: KeyboardEvent) => void

interface UseKeyOptions<T extends UseEventTarget> {
    event?: 'keydown' | 'keypress' | 'keyup'
    target?: T | null
    options?: UseEventOptions<T>
}

const createKeyPredicate = (keyFilter: KeyFilter): KeyPredicate =>
    typeof keyFilter === 'function'
        ? keyFilter
        : typeof keyFilter === 'string'
        ? (event: KeyboardEvent) => event.key === keyFilter
        : keyFilter
        ? () => true
        : () => false

export default function useKey<T extends UseEventTarget>(
    key: KeyFilter,
    fn: Handler = noop,
    opts: UseKeyOptions<T> = {},
    deps: DependencyList = [key]
) {
    const {event = 'keydown', target, options} = opts
    const useMemoHandler = useMemo(() => {
        const predicate: KeyPredicate = createKeyPredicate(key)
        const handler: Handler = (handlerEvent) => {
            if (predicate(handlerEvent)) {
                return fn(handlerEvent)
            }
        }
        return handler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
    useEvent(event, useMemoHandler, target, options)
}
