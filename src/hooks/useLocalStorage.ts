import {
    Dispatch,
    SetStateAction,
    useCallback,
    useState,
    useRef,
    useLayoutEffect,
} from 'react'

import useEvent from './useEvent'

type CustomLocalStorageEventPayload = {key: string}
type CustomLocalStorageEvent = CustomEvent<CustomLocalStorageEventPayload>

declare global {
    interface WindowEventMap {
        'local-storage': CustomLocalStorageEvent
    }
}

const useLocalStorage = <T>(
    key: string,
    defaultValue: T
): [T, Dispatch<SetStateAction<T | undefined>>, () => void] => {
    const initializer = useRef((key: string): T => {
        try {
            const localStorageValue = localStorage.getItem(key)
            if (localStorageValue !== null) {
                return JSON.parse(localStorageValue) as T
            }
            if (defaultValue) {
                localStorage.setItem(key, JSON.stringify(defaultValue))
            }
            return defaultValue
        } catch {
            // localStorage, JSON.parse and JSON.stringify can throw
            return defaultValue
        }
    })

    const [state, setState] = useState<T>(() => initializer.current(key))

    const stateRef = useRef(state)
    stateRef.current = state

    useLayoutEffect(() => setState(initializer.current(key)), [key])

    const resultingSetState: Dispatch<SetStateAction<T | undefined>> =
        useCallback(
            (valOrFunc) => {
                try {
                    const newState =
                        valOrFunc instanceof Function
                            ? valOrFunc(stateRef.current)
                            : valOrFunc

                    if (newState === undefined) return

                    localStorage.setItem(key, JSON.stringify(newState))
                    setState(newState)

                    window.dispatchEvent(
                        new CustomEvent<CustomLocalStorageEventPayload>(
                            'local-storage',
                            {
                                detail: {key},
                            }
                        )
                    )
                } catch {
                    // localStorage, JSON.parse and JSON.stringify can throw
                }
            },
            [key, setState]
        )

    const remove = useCallback(() => {
        try {
            localStorage.removeItem(key)
            setState(defaultValue)
        } catch {
            // localStorage can throw
        }
    }, [key, setState, defaultValue])

    const handleStorageChange = useCallback(
        (event: StorageEvent | CustomLocalStorageEvent) => {
            const keyFromEvent =
                (event as StorageEvent).key ||
                (event as CustomLocalStorageEvent).detail?.key

            if (keyFromEvent !== key) {
                return
            }

            try {
                const localStorageValue = localStorage.getItem(key)
                if (localStorageValue === null) {
                    return setState(defaultValue)
                }
                setState(JSON.parse(localStorageValue) as T)
            } catch {
                // localStorage, JSON.parse and JSON.stringify can throw
            }
        },
        [key, defaultValue]
    )

    // Triggered when changing local storage value in other tabs
    useEvent('storage', handleStorageChange)

    // Triggered when changing local storage value in the current tab with a custom event
    useEvent('local-storage', handleStorageChange)

    return [state, resultingSetState, remove]
}

export default useLocalStorage
