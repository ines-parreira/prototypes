import { useMemo } from 'react'

import { IntlDisplayNames } from '@repo/utils'

import type { Language } from '@gorgias/helpdesk-types'

import { useCurrentUserLanguagePreferences } from '../hooks/useCurrentUserLanguagePreferences'
import { DisplayedContent } from '../store/constants'
import { useTicketMessageTranslationDisplay } from '../store/useTicketMessageTranslationDisplay'

export const useTicketTranslationHelper = (language: Language) => {
    const { primary } = useCurrentUserLanguagePreferences()
    const allMessageDisplayState = useTicketMessageTranslationDisplay(
        (state) => state.allMessageDisplayState,
    )
    return useMemo(() => {
        if (allMessageDisplayState === DisplayedContent.Translated) {
            return `Ticket translated from ${IntlDisplayNames.of(language)}`
        }

        if (!primary) {
            return 'Translate ticket'
        }

        return `Translate ticket to ${IntlDisplayNames.of(primary as Language)}`
    }, [language, allMessageDisplayState, primary])
}
