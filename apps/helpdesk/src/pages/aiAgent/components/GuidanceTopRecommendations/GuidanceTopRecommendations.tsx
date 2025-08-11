import { LoadingSpinner } from '@gorgias/axiom'

import { GuidanceAiSuggestionsList } from 'pages/aiAgent/components/GuidanceAiSuggestionsList/GuidanceAiSuggestionsList'
import { AIGuidance } from 'pages/aiAgent/types'

import css from './GuidanceTopRecommendations.less'

type Props = {
    aiGuidances: AIGuidance[]
    shopName: string
    isLoading: boolean
}

export const GuidanceTopRecommendations = ({
    aiGuidances,
    shopName,
    isLoading,
}: Props) => {
    if (isLoading) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner />
            </div>
        )
    }

    if (!aiGuidances || aiGuidances.length === 0) {
        return null
    }

    return (
        <div className={css.container}>
            <h3 className="heading-section-semibold mb-1">
                Top recommendations based on your tickets
            </h3>
            <GuidanceAiSuggestionsList
                guidanceAiSuggestions={aiGuidances.slice(0, 3)}
                shopName={shopName}
                showAllSuggestionsCard={aiGuidances.length > 3}
                source="recommendations"
            />
        </div>
    )
}
