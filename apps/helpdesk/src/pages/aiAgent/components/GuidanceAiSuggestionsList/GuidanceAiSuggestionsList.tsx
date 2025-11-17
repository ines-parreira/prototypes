import { logEvent, SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'

import { useAiAgentNavigation } from '../../hooks/useAiAgentNavigation'
import type { AIGuidance } from '../../types'
import { GuidanceAiSuggestionCard } from '../GuidanceAiSuggestionCard/GuidanceAiSuggestionCard'
import { SeeAllSuggestionsCard } from '../SeeAllSuggestionsCard/SeeAllSuggestionsCard'

import css from './GuidanceAiSuggestionsList.less'

type Props = {
    guidanceAiSuggestions: AIGuidance[]
    shopName: string
    showBanner?: boolean
    showAllSuggestionsCard?: boolean
    source?: string
}

export const GuidanceAiSuggestionsList = ({
    guidanceAiSuggestions,
    shopName,
    showBanner,
    showAllSuggestionsCard,
    source,
}: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })

    const onAiSuggestionClick = (aiGuidance: AIGuidance) => {
        logEvent(SegmentEvent.AiAgentGuidanceCardClicked, {
            source: source ?? 'library',
            type: 'ai',
            name: aiGuidance.name,
        })
        history.push(routes.newGuidanceAiSuggestionArticle(aiGuidance.key))
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
                        onClick={() => onAiSuggestionClick(guidance)}
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
