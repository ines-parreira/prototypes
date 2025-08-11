import { useCallback, useEffect, useState } from 'react'

import cn from 'classnames'

import { BadgeIcon, Button } from '@gorgias/axiom'
import { FeedbackExecutionsItemFeedbackItem } from '@gorgias/knowledge-service-types'

import AutoSaveBadge from '../AutoSaveBadge'
import { AutoSaveState, FeedbackRating } from '../types'

import css from './AIAgentTicketLevelFeedback.less'

export type AIAgentFeedbackRatingSectionProps = {
    loadingMutations?: string[]
    lastUpdated?: Date
    ticketRating?: FeedbackExecutionsItemFeedbackItem
    badInteractionReasons?: FeedbackExecutionsItemFeedbackItem[]
    handleFeedbackChange: (
        data: {
            resourceType: 'TICKET_RATING' | 'TICKET_BAD_INTERACTION_REASON'
            id?: number
            feedbackValue: string | null
        }[],
    ) => void
}

export const AIAgentFeedbackRatingSection = ({
    loadingMutations,
    lastUpdated,
    ticketRating,
    badInteractionReasons,
    handleFeedbackChange,
}: AIAgentFeedbackRatingSectionProps) => {
    const [selectedRating, setSelectedRating] = useState<FeedbackRating>()

    useEffect(() => {
        if (ticketRating?.feedbackValue) {
            setSelectedRating(ticketRating.feedbackValue as FeedbackRating)
        }
    }, [ticketRating])

    const handleTicketRatingChange = useCallback(
        (value: FeedbackRating) => {
            if (value === selectedRating) return
            setSelectedRating(value)
            const feedbackToUpsert: Parameters<
                AIAgentFeedbackRatingSectionProps['handleFeedbackChange']
            >[0] = [
                {
                    resourceType: 'TICKET_RATING',
                    feedbackValue: value,
                    id: ticketRating?.id,
                },
            ]
            if (value === FeedbackRating.GOOD && badInteractionReasons) {
                feedbackToUpsert.push(
                    ...badInteractionReasons.map((reason) => ({
                        resourceType: 'TICKET_BAD_INTERACTION_REASON' as const,
                        feedbackValue: null,
                        id: reason.id,
                    })),
                )
            }
            handleFeedbackChange(feedbackToUpsert)
        },
        [
            handleFeedbackChange,
            ticketRating?.id,
            selectedRating,
            badInteractionReasons,
        ],
    )

    return (
        <div className={css.ratingButtonsContainer}>
            <div className={css.headerContainer}>
                <span className={css.header}>How was this conversation?</span>
                <AutoSaveBadge
                    state={
                        !loadingMutations
                            ? AutoSaveState.INITIAL
                            : loadingMutations.length > 0
                              ? AutoSaveState.SAVING
                              : AutoSaveState.SAVED
                    }
                    updatedAt={lastUpdated}
                />
            </div>
            <div className={css.ratingButtons}>
                <Button
                    className={cn(css.ratingButton, {
                        [css.buttonPressed]:
                            selectedRating === FeedbackRating.BAD,
                    })}
                    onClick={() => handleTicketRatingChange(FeedbackRating.BAD)}
                >
                    <BadgeIcon
                        icon={
                            <i className="material-icons">
                                sentiment_very_dissatisfied
                            </i>
                        }
                    />
                    <span>Bad</span>
                </Button>
                <Button
                    className={cn(css.ratingButton, {
                        [css.buttonPressed]:
                            selectedRating === FeedbackRating.OK,
                    })}
                    onClick={() => handleTicketRatingChange(FeedbackRating.OK)}
                >
                    <BadgeIcon
                        icon={
                            <i className="material-icons">sentiment_neutral</i>
                        }
                    />
                    <span>Okay</span>
                </Button>
                <Button
                    className={cn(css.ratingButton, {
                        [css.buttonPressed]:
                            selectedRating === FeedbackRating.GOOD,
                    })}
                    onClick={() =>
                        handleTicketRatingChange(FeedbackRating.GOOD)
                    }
                >
                    <BadgeIcon
                        icon={
                            <i className="material-icons">
                                sentiment_very_satisfied
                            </i>
                        }
                    />
                    <span>Good</span>
                </Button>
            </div>
        </div>
    )
}
