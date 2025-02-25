import React from 'react'

import classNames from 'classnames'

import { logEvent, SegmentEvent } from 'common/segment'
import Button from 'pages/common/components/button/Button'
import history from 'pages/history'

import { useAiAgentNavigation } from '../../hooks/useAiAgentNavigation'

import css from './SeeAllSuggestionsCard.less'

type Props = {
    shopName: string
}

export const SeeAllSuggestionsCard = ({ shopName }: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })

    const onSeeAllSugestionsClick = () => {
        logEvent(SegmentEvent.AiAgentGuidanceLibraryViewed, {
            source: 'see_all_suggestions',
        })
        history.push(routes.guidanceLibrary)
    }

    return (
        <Button
            fillStyle="ghost"
            className={css.container}
            onClick={onSeeAllSugestionsClick}
        >
            See All Suggestions
            <i
                className={classNames('material-icons', css.arrowForward)}
                aria-label="arrow forward"
            >
                arrow_forward
            </i>
        </Button>
    )
}
