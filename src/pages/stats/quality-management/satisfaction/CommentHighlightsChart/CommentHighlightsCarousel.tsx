import {Skeleton} from '@gorgias/merchant-ui-kit'
import _truncate from 'lodash/truncate'
import React, {useMemo} from 'react'
import {Link} from 'react-router-dom'
import Slider from 'react-slick'

import analyticsColorsModern from 'assets/css/new/stats/modern.json'
import {
    CommentHighlightsData,
    FormattedCommentHighlightQueryData,
} from 'hooks/reporting/quality-management/satisfaction/useCommentHighlights'
import Avatar from 'pages/common/components/Avatar/Avatar'
import IconButton from 'pages/common/components/button/IconButton'
import {Separator} from 'pages/common/components/Separator/Separator'
import StarRating from 'pages/common/components/StarRating'
import {NOT_AVAILABLE_PLACEHOLDER} from 'pages/stats/common/utils'
import css from 'pages/stats/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsCarousel.less'

const VIEW_TICKET = 'View Ticket'
const MAX_COMMENT_LENGTH = 350

const NO_DATA_ITEM = {
    surveyScore: '0',
    comment: 'No data available for the selected filters.',
    ticketId: null,
    assignee: {
        name: NOT_AVAILABLE_PLACEHOLDER,
    },
    customerName: 'No data',
}

export default function CommentHighlightsCarousel({
    isFetching,
    data,
}: FormattedCommentHighlightQueryData) {
    const carouselData = useMemo(
        () => (data && data.length > 0 ? data : [NO_DATA_ITEM]),
        [data]
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
    assignee,
    customerName,
    comment,
    surveyScore,
    ticketId,
}: CommentHighlightsData) {
    return (
        <div key={`${ticketId}`} className={css.wrapper}>
            <div className={css.infoWrapper}>
                <Avatar
                    className={css.avatar}
                    size={48}
                    shape="round"
                    name={assignee?.name || NOT_AVAILABLE_PLACEHOLDER}
                    {...(assignee?.url && {
                        url: assignee.url,
                    })}
                />
                <div className={css.details}>
                    <div className={css.agentName}>
                        {assignee?.name || NOT_AVAILABLE_PLACEHOLDER}
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
