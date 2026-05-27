import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import { useConfigureSuggestions } from '@gorgias/copilot'

import { getCopilotConversationStarters } from './conversationStarters'

export function CopilotConversationStarters() {
    const { pathname } = useLocation()
    const suggestions = useMemo(
        () => getCopilotConversationStarters(pathname),
        [pathname],
    )

    useConfigureSuggestions({
        available: 'before-first-message',
        suggestions,
    })

    return null
}
