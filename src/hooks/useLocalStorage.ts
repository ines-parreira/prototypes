import {
    Dispatch,
    SetStateAction,
    useCallback,
    useState,
    useRef,
    useLayoutEffect,
} from 'react'

type ParserOptions<T> =
    | {
          raw: true
      }
    | {
          raw: false
          serializer: (value: T) => string
          deserializer: (value: string) => T
      }

const useLocalStorage = <T>(
    key: string,
    initialValue?: T,
    options?: ParserOptions<T>
): [T | undefined, Dispatch<SetStateAction<T | undefined>>, () => void] => {
    if (!key) {
        throw new Error('useLocalStorage key may not be falsy')
    }

    const deserializer: (value: any) => T = options
        ? options.raw
            ? (value) => value as unknown
            : options.deserializer
        : JSON.parse

    const initializer = useRef((key: string): T | undefined => {
        try {
            const serializer = options
                ? options.raw
                    ? String
                    : options.serializer
                : JSON.stringify

            const localStorageValue = localStorage.getItem(key)
            if (localStorageValue !== null) {
                return deserializer(localStorageValue)
            }
            initialValue && localStorage.setItem(key, serializer(initialValue))
            return initialValue
        } catch {
            // If user is in private mode or has storage restriction
            // localStorage can throw. JSON.parse and JSON.stringify
            // can throw, too.
            return initialValue
        }
    })

    const [state, setState] = useState<T | undefined>(() =>
        initializer.current(key)
    )

    useLayoutEffect(() => setState(initializer.current(key)), [key])

    const set: Dispatch<SetStateAction<T | undefined>> = useCallback(
        (valOrFunc) => {
            type DisaptchFunction = (value: T | undefined) => T
            try {
                const newState =
                    typeof valOrFunc === 'function'
                        ? (valOrFunc as DisaptchFunction)(state)
                        : valOrFunc
                if (typeof newState === 'undefined') return
                let value: string

                if (options)
                    if (options.raw)
                        if (typeof newState === 'string') value = newState
                        else value = JSON.stringify(newState)
                    else if (options.serializer)
                        value = options.serializer(newState)
                    else value = JSON.stringify(newState)
                else value = JSON.stringify(newState)

                localStorage.setItem(key, value)
                setState(deserializer(value))
            } catch {
                // If user is in private mode or has storage restriction
                // localStorage can throw. Also JSON.stringify can throw.
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key, setState]
    )

    const remove = useCallback(() => {
        try {
            localStorage.removeItem(key)
            setState(undefined)
        } catch {
            // If user is in private mode or has storage restriction
            // localStorage can throw.
        }
    }, [key, setState])

    return [state, set, remove]
}

export default useLocalStorage
