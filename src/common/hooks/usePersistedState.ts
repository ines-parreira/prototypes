import {useCallback, useRef, useState} from 'react'

import {tryLocalStorage} from 'services/common/utils'

export default function usePersistedState<T>(key: string, initialValue: T) {
    const persistedValue = useRef<T | null>(null)

    if (persistedValue.current === null) {
        tryLocalStorage(() => {
            const existingValue = localStorage.getItem(key)
            if (existingValue) {
                persistedValue.current = JSON.parse(existingValue)
            } else {
                localStorage.setItem(key, JSON.stringify(initialValue))
                persistedValue.current = initialValue
            }
        })
    }

    const [state, setState] = useState<T>(persistedValue.current!)

    const setValue = useCallback(
        (value: T) => {
            tryLocalStorage(() => {
                localStorage.setItem(key, JSON.stringify(value))
            })
            setState(value)
        },
        [key]
    )

    return [state, setValue] as const
}
