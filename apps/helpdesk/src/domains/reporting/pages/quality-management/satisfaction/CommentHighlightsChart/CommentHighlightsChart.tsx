import React, { useMemo } from 'react'

import { useCommentHighlights } from 'domains/reporting/hooks/quality-management/satisfaction/useCommentHighlights'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import CommentHighlightsCarousel from 'domains/reporting/pages/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsCarousel'
import CommentHighlightCsatSentimentToggle from 'domains/reporting/pages/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsCsatSentimentToggle'
import { getCommentHighlightsCsatSentiment } from 'domains/reporting/state/ui/stats/qualityManagementSlice'
import { CsatSentiment } from 'domains/reporting/state/ui/stats/types'
import useAppSelector from 'hooks/useAppSelector'

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
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
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
