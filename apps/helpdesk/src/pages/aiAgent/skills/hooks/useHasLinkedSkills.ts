import { useMemo } from 'react'

import { useListIntents } from 'models/helpCenter/queries'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

/**
 * Hook to check if there are any linked skills (intents with linked articles)
 * Used to determine whether to show the empty state or skills content
 */
export const useHasLinkedSkills = () => {
    const { isLoading: isLoadingStoreConfiguration, storeConfiguration } =
        useAiAgentStoreConfigurationContext()

    const helpCenterId = storeConfiguration?.guidanceHelpCenterId

    const {
        data,
        isLoading: isLoadingIntents,
        isError,
    } = useListIntents(helpCenterId || 0, {
        enabled: !isLoadingStoreConfiguration && !!helpCenterId,
    })

    const hasLinkedSkills = useMemo(() => {
        if (!data?.intents) return false
        return data.intents.some((intent) => intent.status === 'linked')
    }, [data])

    return {
        hasLinkedSkills,
        isLoading: isLoadingStoreConfiguration || isLoadingIntents,
        isError,
    }
}
