import React, { useMemo } from 'react'

import { useCommentHighlights } from 'hooks/reporting/quality-management/satisfaction/useCommentHighlights'
import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import ChartCard from 'pages/stats/ChartCard'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import CommentHighlightsCarousel from 'pages/stats/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsCarousel'
import CommentHighlightCsatSentimentToggle from 'pages/stats/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsCsatSentimentToggle'
import { getCommentHighlightsCsatSentiment } from 'state/ui/stats/qualityManagementSlice'
import { CsatSentiment } from 'state/ui/stats/types'

export const COMMENT_HIGHLIGHTS = {
    TITLE: 'Comment Highlights',
    DESCRIPTION:
        'Most enthusiastic or negative feedback received during this period.',
}

const QUERY_SCORES = {
    [CsatSentiment.Positive]: ['4', '5'],
    [CsatSentiment.Negative]: ['1', '2', '3'],
}

export default function CommentHighlightsChart(props: DashboardChartProps) {
    const { cleanStatsFilters, userTimezone } = useNewStatsFilters()
    const commentHighlightsCsatSentiment = useAppSelector(
        getCommentHighlightsCsatSentiment,
    )
    const queryScores = useMemo(
        () => QUERY_SCORES[commentHighlightsCsatSentiment],
        [commentHighlightsCsatSentiment],
    )

    const data = useCommentHighlights(
        cleanStatsFilters,
        userTimezone,
        queryScores,
    )

    return (
        <ChartCard
            title={COMMENT_HIGHLIGHTS.TITLE}
            hint={{
                title: COMMENT_HIGHLIGHTS.DESCRIPTION,
            }}
            titleExtra={<CommentHighlightCsatSentimentToggle />}
            {...props}
        >
            <CommentHighlightsCarousel {...data} />
        </ChartCard>
    )
}
