import React from 'react'
import Loader from 'pages/common/components/Loader/Loader'
import {AIGuidance} from '../../types'
import {GuidanceAiSuggestionsList} from '../GuidanceAiSuggestionsList/GuidanceAiSuggestionsList'
import {DATA_TEST_ID} from '../../constants'
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
            <Loader
                data-testid={DATA_TEST_ID.Loader}
                minHeight="32px"
                size="32px"
            />
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
                showAllSuggestionsCard
            />
        </div>
    )
}
