import { useMemo } from 'react'

import { IntlDisplayNames } from '@repo/utils'

import type { Language } from '@gorgias/helpdesk-types'

import { DisplayedContent } from '../store/constants'
import { useTicketMessageTranslationDisplay } from '../store/useTicketMessageTranslationDisplay'
import { useCurrentUserLanguagePreferences } from './useCurrentUserLanguagePreferences'

export const useTicketTranslationHelper = (language: Language | null) => {
    const { primary } = useCurrentUserLanguagePreferences()
    const allMessageDisplayState = useTicketMessageTranslationDisplay(
        (state) => state.allMessageDisplayState,
    )
    return useMemo(() => {
        if (!language || !primary) return 'Translate ticket'

        if (allMessageDisplayState === DisplayedContent.Translated) {
            return `Ticket translated from ${IntlDisplayNames.of(language)}`
        }

        return `Translate ticket to ${IntlDisplayNames.of(primary as Language)}`
    }, [language, allMessageDisplayState, primary])
}
