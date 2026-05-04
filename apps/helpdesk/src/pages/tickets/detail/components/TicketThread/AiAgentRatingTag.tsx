import type React from 'react'

import { Icon, Tag, TagColor } from '@gorgias/axiom'

import { FeedbackRating } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

const RATING_TAG_COLOR: Record<FeedbackRating, TagColor> = {
    [FeedbackRating.GOOD]: TagColor.Green,
    [FeedbackRating.OK]: TagColor.Grey,
    [FeedbackRating.BAD]: TagColor.Orange,
}

const RATING_LABEL: Record<FeedbackRating, string> = {
    [FeedbackRating.GOOD]: 'Positive',
    [FeedbackRating.OK]: 'Neutral',
    [FeedbackRating.BAD]: 'Negative',
}

const RATING_ICON: Record<FeedbackRating, React.ReactNode> = {
    [FeedbackRating.GOOD]: <Icon name="emoji-smile" size="sm" />,
    [FeedbackRating.OK]: <Icon name="emoji-neutral" size="sm" />,
    [FeedbackRating.BAD]: <Icon name="emoji-sad" size="sm" />,
}

type AiAgentRatingTagProps = {
    rating: FeedbackRating
}

export function AiAgentRatingTag({ rating }: AiAgentRatingTagProps) {
    return (
        <Tag
            color={RATING_TAG_COLOR[rating]}
            size="sm"
            leadingSlot={RATING_ICON[rating]}
        >
            {RATING_LABEL[rating]}
        </Tag>
    )
}
