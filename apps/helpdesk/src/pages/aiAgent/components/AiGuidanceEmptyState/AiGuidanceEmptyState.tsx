import { logEvent, SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import classNames from 'classnames'

import { Badge, LegacyButton as Button } from '@gorgias/axiom'

import imgSrc from 'assets/img/ai-agent/guidance-empty-state.png'
import { GuidanceAiSuggestionsList } from 'pages/aiAgent/components/GuidanceAiSuggestionsList/GuidanceAiSuggestionsList'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { AIGuidance } from 'pages/aiAgent/types'

import css from './AiGuidanceEmptyState.less'

type Props = {
    aiGuidances: AIGuidance[]
    shopName: string
}
const AiGuidanceEmptyState = ({ aiGuidances, shopName }: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })

    const onNewClick = () => {
        history.push(routes.newGuidanceArticle)
    }

    const onBrowseSuggestions = () => {
        logEvent(SegmentEvent.AiAgentGuidanceLibraryViewed, {
            source: 'browse_suggestions',
        })
        history.push(routes.guidanceLibrary)
    }

    return (
        <div className={css.container}>
            <div className={css.bannerContainer}>
                <div className={css.innerContainer}>
                    <div className={css.content}>
                        <div>
                            <Badge type={'magenta'}>
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.autoAwesome,
                                    )}
                                >
                                    auto_awesome
                                </i>
                                AI Generated
                            </Badge>
                        </div>
                        <p className={css.title}>
                            Add Guidance to tell AI Agent how to handle specific
                            topics or inquiries, and when to escalate tickets to
                            your team.
                        </p>
                        <p className={css.subtitle}>
                            Leverage AI generated Guidance based on the unique
                            interactions you have with your customers.
                        </p>
                    </div>
                    <div className={css.imageWrapper}>
                        <img
                            className={css.img}
                            src={imgSrc}
                            alt="Guidance Empty State"
                        />
                    </div>
                </div>
            </div>
            <div className={css.aiGuidancesContainer}>
                <div className={css.aiGuidancesListHeader}>
                    <h3 className="heading-section-semibold mb-1">
                        Top recommendations based on your tickets
                    </h3>
                    <div className={css.buttons}>
                        <Button intent="secondary" onClick={onNewClick}>
                            Create Custom Guidance
                        </Button>
                        <Button onClick={onBrowseSuggestions}>
                            Start from Template
                        </Button>
                    </div>
                </div>
                <GuidanceAiSuggestionsList
                    guidanceAiSuggestions={aiGuidances}
                    shopName={shopName}
                    source="empty"
                />
            </div>
        </div>
    )
}

export default AiGuidanceEmptyState
