import React, { useCallback, useMemo } from 'react'

import { getMetricQuery } from 'hooks/reporting/quality-management/satisfaction/utils'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import { LineChart } from 'pages/stats/common/components/charts/LineChart/LineChart'
import { formatLabeledTooltipTimeSeriesData } from 'pages/stats/common/utils'
import { LINES_COLORS } from 'pages/stats/constants'
import css from 'pages/stats/quality-management/satisfaction/AverageScorePerDimensionTrendChart/AverageScoreMetric.less'
import {
    formatZeroToNALabel,
    getFormattedInfo,
} from 'pages/stats/quality-management/satisfaction/AverageScorePerDimensionTrendChart/utils'
import { getAllAgentsJS } from 'state/agents/selectors'
import { getIntegrations } from 'state/integrations/selectors'

const DIMENSION = TicketDimension.AssigneeUserId

export const AverageScorePerAssigneeMetric = () => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()
    const useMetricQuery = getMetricQuery(DIMENSION)
    const { isFetching, data, isError } = useMetricQuery(
        cleanStatsFilters,
        userTimezone,
        granularity,
    )

    const integrations = useAppSelector(getIntegrations)
    const agents = useAppSelector(getAllAgentsJS)

    const getAgentDetails = useCallback(
        (id: number) => agents.find((agent) => agent.id === id),
        [agents],
    )

    const {
        dataToRender,
        initialVisibility,
        labels = [],
        tooltips = [],
    } = useMemo(
        () =>
            getFormattedInfo({
                dimension: DIMENSION,
                data,
                integrations,
                getAgentDetails,
            }),
        [data, getAgentDetails, integrations],
    )

    const isLoading = isFetching || !dataToRender || !labels || !tooltips

    if (isError) {
        return (
            <div className={css.queryErrorMessageContainer}>
                <p>Failed to load data</p>
            </div>
        )
    }

    return (
        <LineChart
            isLoading={isLoading}
            customColors={LINES_COLORS}
            data={formatLabeledTooltipTimeSeriesData(
                dataToRender,
                { labels, tooltips },
                granularity,
                [true],
            )}
            yShowZeroAsNA
            renderYTickLabel={formatZeroToNALabel}
            displayLegend
            toggleLegend
            legendOnLeft
            wrapperclassNames="full-width"
            skeletonHeight={328}
            defaultDatasetVisibility={initialVisibility}
        />
    )
}
