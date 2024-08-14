import React from 'react'
import history from 'pages/history'
import {AIGuidance} from '../../types'
import {useAiAgentNavigation} from '../../hooks/useAiAgentNavigation'
import {SeeAllSuggestionsCard} from '../SeeAllSuggestionsCard/SeeAllSuggestionsCard'
import {GuidanceAiSuggestionCard} from '../GuidanceAiSuggestionCard/GuidanceAiSuggestionCard'
import css from './GuidanceAiSuggestionsList.less'

type Props = {
    guidanceAiSuggestions: AIGuidance[]
    shopName: string
    showBanner?: boolean
    showAllSuggestionsCard?: boolean
}

export const GuidanceAiSuggestionsList = ({
    guidanceAiSuggestions,
    shopName,
    showBanner,
    showAllSuggestionsCard,
}: Props) => {
    const {routes} = useAiAgentNavigation({shopName})

    const onAiSuggestionClick = () => {
        history.push(routes.newGuidanceArticle)
    }

    if (!guidanceAiSuggestions?.length && !showBanner) {
        return null
    }

    if (!guidanceAiSuggestions?.length && showBanner) {
        return (
            <div className={css.banner}>
                You’ve added all AI-generated suggestions to your library.
            </div>
        )
    }

    return (
        <ul className={css.container}>
            {guidanceAiSuggestions.map((guidance: AIGuidance) => (
                <li key={guidance.key}>
                    <GuidanceAiSuggestionCard
                        onClick={() => onAiSuggestionClick()}
                        guidanceAiSuggestion={guidance}
                    />
                </li>
            ))}
            {showAllSuggestionsCard && (
                <li>
                    <SeeAllSuggestionsCard shopName={shopName} />
                </li>
            )}
        </ul>
    )
}
