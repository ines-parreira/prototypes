import { useCallback } from 'react'

import { noop } from 'lodash'

export function useTicketTranslationFailedEventHandler() {
    const handleTicketTranslationFailed = useCallback(noop, [])
    return {
        handleTicketTranslationFailed,
    }
}
