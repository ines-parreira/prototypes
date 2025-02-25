import {useEffect, useState} from 'react'

const useSessionStorage = <T>(
    key: string,
    initialValue?: T,
    raw?: boolean
): [T, (value: T) => void] => {
    const [state, setState] = useState(() => {
        try {
            const sessionStorageValue = sessionStorage.getItem(key)
            if (typeof sessionStorageValue !== 'string') {
                sessionStorage.setItem(
                    key,
                    raw ? String(initialValue) : JSON.stringify(initialValue)
                )
                return initialValue
            }

            return raw
                ? sessionStorageValue
                : (JSON.parse(sessionStorageValue || 'null') as T)
        } catch {
            // If user is in private mode or has storage restriction
            // sessionStorage can throw. JSON.parse and JSON.stringify
            // cat throw, too.
            return initialValue
        }
    })

    // eslint-disable react-hooks/exhaustive-deps
    useEffect(() => {
        try {
            const serializedState = raw ? String(state) : JSON.stringify(state)
            sessionStorage.setItem(key, serializedState)
        } catch {
            // If user is in private mode or has storage restriction
            // sessionStorage can throw. Also JSON.stringify can throw.
        }
    })

    return [state as T, setState]
}

export default useSessionStorage
