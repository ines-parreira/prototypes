import { useGuidanceAiSuggestions } from 'pages/aiAgent/hooks/useGuidanceAiSuggestions'

interface UseGuidanceCountOptions {
    guidanceHelpCenterId: number
    shopName: string
}

export const useGuidanceCount = ({
    guidanceHelpCenterId,
    shopName,
}: UseGuidanceCountOptions) => {
    const { guidanceUsed, isLoadingGuidanceArticleList } =
        useGuidanceAiSuggestions({
            helpCenterId: guidanceHelpCenterId,
            shopName,
            query: '',
        })

    return {
        guidanceCount: guidanceUsed?.length || 0,
        isLoading: isLoadingGuidanceArticleList,
    }
}
