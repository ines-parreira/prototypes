import { useMemo } from 'react'

import { LocaleCode } from 'models/helpCenter/types'
import { useHelpCenterAIArticlesLibrary } from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary'

export const useOpportunitiesCount = (
    helpCenterId: number,
    locale: LocaleCode,
    shopName: string | undefined,
) => {
    const { articles: aiArticles, isLoading } = useHelpCenterAIArticlesLibrary(
        helpCenterId,
        locale,
        shopName ?? null,
    )

    const opportunitiesCount = useMemo(() => {
        return aiArticles?.length ?? 0
    }, [aiArticles])

    return {
        count: opportunitiesCount,
        isLoading,
    }
}
