import { useCallback, useLayoutEffect } from 'react'

import { useLocalStorage } from './useLocalStorage'

export function useLocalStorageWithExpiry<T>(
    key: string,
    expiryTimeInMilliseconds: number,
    defaultValue: T,
) {
    const [value, setValue, removeValue] = useLocalStorage<T>(key, defaultValue)
    const [timestamp, setTimestamp, removeTimestamp] = useLocalStorage<number>(
        `${key}-timestamp`,
        Date.now(),
    )

    const isExpired = useCallback(
        () =>
            timestamp
                ? Date.now() - timestamp > expiryTimeInMilliseconds
                : false,
        [expiryTimeInMilliseconds, timestamp],
    )

    const remove = useCallback(() => {
        removeValue()
        removeTimestamp()
    }, [removeValue, removeTimestamp])

    const setState = useCallback(
        (value: T) => {
            setValue(value)
            setTimestamp(Date.now())
        },
        [setValue, setTimestamp],
    )

    const resetValue = useCallback(() => {
        if (defaultValue != null) {
            setState(defaultValue)
        } else {
            remove()
        }
    }, [setState, defaultValue, remove])

    useLayoutEffect(() => {
        if (isExpired()) {
            resetValue()
        }
    })

    return { state: value, setState, remove }
}
