import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [delay, value])

    return debouncedValue
}
