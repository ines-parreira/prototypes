import { useCallback } from 'react'
import { noop } from '@gorgias/toolkit'

export function useTicketTranslationFailedEventHandler() {
    const handleTicketTranslationFailed = useCallback(noop, [])
    return {
        handleTicketTranslationFailed,
    }
}
