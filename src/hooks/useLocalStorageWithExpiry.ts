import {useCallback, useLayoutEffect} from 'react'

import useLocalStorage from 'hooks/useLocalStorage'

export default function useLocalStorageWithExpiry<T>(
    key: string,
    expiryTime: number,
    initialValue?: T
) {
    const [value, setValue, removeValue] = useLocalStorage<T>(key, initialValue)
    const [timestamp, setTimestamp, removeTimestamp] = useLocalStorage<number>(
        `${key}-timestamp`,
        initialValue ? Date.now() : undefined
    )

    const isExpired = useCallback(
        () => (timestamp ? Date.now() - timestamp > expiryTime : false),
        [expiryTime, timestamp]
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
        [setValue, setTimestamp]
    )

    const resetValue = useCallback(() => {
        if (initialValue != null) {
            setState(initialValue)
        } else {
            remove()
        }
    }, [setState, initialValue, remove])

    useLayoutEffect(() => {
        if (isExpired()) {
            resetValue()
        }
    })

    return {state: value, setState, remove}
}
