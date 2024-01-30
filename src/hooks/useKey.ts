import {DependencyList, useMemo} from 'react'
import noop from 'lodash/noop'
import useEvent from './useEvent'

type KeyPredicate = (event: KeyboardEvent) => boolean
type KeyFilter = null | undefined | string | ((event: KeyboardEvent) => boolean)
type Handler = (event: KeyboardEvent) => void

interface UseKeyOptions {
    event?: 'keydown' | 'keypress' | 'keyup'
    target?: Element | null
    options?: AddEventListenerOptions
}

const createKeyPredicate = (keyFilter: KeyFilter): KeyPredicate =>
    typeof keyFilter === 'function'
        ? keyFilter
        : typeof keyFilter === 'string'
        ? (event: KeyboardEvent) => event.key === keyFilter
        : keyFilter
        ? () => true
        : () => false

export default function useKey(
    key: KeyFilter,
    fn: Handler = noop,
    opts: UseKeyOptions = {},
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
