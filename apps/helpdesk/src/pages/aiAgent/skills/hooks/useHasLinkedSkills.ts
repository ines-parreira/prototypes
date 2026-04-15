import { useGetHelpCenterArticleList } from 'models/helpCenter/queries'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

export const useHasLinkedSkills = () => {
    const { isLoading: isLoadingStoreConfiguration, storeConfiguration } =
        useAiAgentStoreConfigurationContext()

    const helpCenterId = storeConfiguration?.guidanceHelpCenterId

    const {
        data,
        isLoading: isLoadingArticles,
        isError,
    } = useGetHelpCenterArticleList(
        helpCenterId || 0,
        {
            origin: 'skill',
            per_page: 1,
        },
        {
            enabled: !isLoadingStoreConfiguration && !!helpCenterId,
        },
    )

    const hasSkills = (data?.data?.length ?? 0) > 0

    return {
        hasSkills,
        isLoading: isLoadingStoreConfiguration || isLoadingArticles,
        isError,
    }
}
