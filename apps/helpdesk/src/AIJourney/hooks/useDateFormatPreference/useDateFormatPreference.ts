import { useCallback } from 'react'

import { useLocalStorage } from '@repo/hooks'

export type DateFormatPreference = 'absolute' | 'relative'

const STORAGE_KEY = 'ai-journey-date-format-preference'
const DEFAULT_FORMAT: DateFormatPreference = 'absolute'

export const useDateFormatPreference = (): {
    format: DateFormatPreference
    toggleFormat: () => void
} => {
    const [format, setFormat] = useLocalStorage<DateFormatPreference>(
        STORAGE_KEY,
        DEFAULT_FORMAT,
    )

    const toggleFormat = useCallback(() => {
        setFormat((current) =>
            current === 'absolute' ? 'relative' : 'absolute',
        )
    }, [setFormat])

    return { format, toggleFormat }
}
