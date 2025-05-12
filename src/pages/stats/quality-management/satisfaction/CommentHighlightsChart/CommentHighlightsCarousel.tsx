import { useMemo } from 'react'

import _truncate from 'lodash/truncate'
import { Link } from 'react-router-dom'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import analyticsColorsModern from 'assets/css/new/stats/modern.json'
import {
    CommentHighlightsData,
    FormattedCommentHighlightQueryData,
} from 'hooks/reporting/quality-management/satisfaction/useCommentHighlights'
import Avatar from 'pages/common/components/Avatar/Avatar'
import IconButton from 'pages/common/components/button/IconButton'
import { Separator } from 'pages/common/components/Separator/Separator'
import StarRating from 'pages/common/components/StarRating'
import { NOT_AVAILABLE_PLACEHOLDER } from 'pages/stats/common/utils'
import css from 'pages/stats/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsCarousel.less'
import Slider from 'utils/wrappers/Slider'

const VIEW_TICKET = 'View Ticket'
const MAX_COMMENT_LENGTH = 350

const NO_DATA_ITEM = {
    surveyScore: '0',
    comment: 'No data available for the selected filters.',
    ticketId: null,
    assignedAgent: {
        name: NOT_AVAILABLE_PLACEHOLDER,
    },
    customerName: 'No data',
    assignedTeam: null,
}

export const UNASSIGNED_TICKET_LABEL = 'Unassigned ticket'

export default function CommentHighlightsCarousel({
    isFetching,
    data,
}: FormattedCommentHighlightQueryData) {
    const carouselData = useMemo(
        () => (data && data.length > 0 ? data : [NO_DATA_ITEM]),
        [data],
    )

    const dataKey = useMemo(() => JSON.stringify(data), [data])

    if (isFetching) {
        return (
            <div className="p-4">
                <Skeleton height={48} />
                <Skeleton height={161} className="mt-4" />
            </div>
        )
    }

    return (
        <div className={css.commentHighlightCarousel}>
            <Slider
                key={dataKey}
                dots
                arrows
                infinite={false}
                customPaging={() => <div className={css.styledDot} />}
                nextArrow={
                    <IconButton
                        intent="secondary"
                        fillStyle="ghost"
                        size="medium"
                    >
                        keyboard_arrow_right
                    </IconButton>
                }
                prevArrow={
                    <IconButton
                        intent="secondary"
                        fillStyle="ghost"
                        size="medium"
                    >
                        keyboard_arrow_left
                    </IconButton>
                }
            >
                {carouselData.map((slide) => (
                    <CommentHighlightsCarouselItem
                        key={slide.ticketId}
                        {...slide}
                    />
                ))}
            </Slider>
        </div>
    )
}

function CommentHighlightsCarouselItem({
    assignedAgent,
    customerName,
    comment,
    surveyScore,
    ticketId,
    assignedTeam,
}: CommentHighlightsData) {
    return (
        <div key={`${ticketId}`} className={css.wrapper}>
            <div className={css.infoWrapper}>
                <Avatar
                    className={css.avatar}
                    size={48}
                    shape="round"
                    name={assignedAgent?.name || NOT_AVAILABLE_PLACEHOLDER}
                    {...(assignedAgent?.url && {
                        url: assignedAgent.url,
                    })}
                    isAIAgent={assignedAgent?.isBot}
                />
                <div className={css.details}>
                    <div className={css.assignee}>
                        <TicketAssignee
                            assignedAgent={assignedAgent}
                            assignedTeam={assignedTeam}
                        />
                    </div>
                    <div className={css.ticketDetails}>
                        {ticketId ? (
                            <Link
                                to={`/app/ticket/${ticketId}`}
                                target="_blank"
                            >
                                {VIEW_TICKET}
                            </Link>
                        ) : (
                            <div>{VIEW_TICKET}</div>
                        )}
                        <Separator
                            direction="vertical"
                            className={css.separator}
                        />
                        <StarRating
                            key={ticketId}
                            value={parseInt(surveyScore || '0')}
                            size={24}
                            activeColor={
                                analyticsColorsModern.analytics.data.yellow
                                    .value
                            }
                            classNames={css.starRating}
                        />
                    </div>
                </div>
            </div>

            <div className={css.commentWrapper}>
                <div className={css.customerName}>
                    {customerName || NOT_AVAILABLE_PLACEHOLDER}
                </div>
                <div className={css.commentBody}>
                    {_truncate(comment || NOT_AVAILABLE_PLACEHOLDER, {
                        length: MAX_COMMENT_LENGTH,
                        omission: '...',
                    })}
                </div>
            </div>
        </div>
    )
}

type TicketAssigneeProps = Pick<
    CommentHighlightsData,
    'assignedAgent' | 'assignedTeam'
>

function TicketAssignee({ assignedAgent, assignedTeam }: TicketAssigneeProps) {
    if (assignedAgent?.name) {
        return <>{assignedAgent.name}</>
    }

    if (assignedTeam) {
        const { name, emoji } = assignedTeam
        return (
            <>
                {emoji && <span>{emoji}</span>}
                <span>{name}</span>
            </>
        )
    }

    return <>{UNASSIGNED_TICKET_LABEL}</>
}
