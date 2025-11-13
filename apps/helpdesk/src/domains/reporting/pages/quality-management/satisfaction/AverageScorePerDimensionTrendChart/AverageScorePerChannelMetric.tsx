import React, { useCallback, useMemo } from 'react'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { getMetricQuery } from 'domains/reporting/hooks/quality-management/satisfaction/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { LineChart } from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { formatLabeledTooltipTimeSeriesData } from 'domains/reporting/pages/common/utils'
import { LINES_COLORS } from 'domains/reporting/pages/constants'
import css from 'domains/reporting/pages/quality-management/satisfaction/AverageScorePerDimensionTrendChart/AverageScoreMetric.less'
import {
    formatZeroToNALabel,
    getFormattedInfo,
} from 'domains/reporting/pages/quality-management/satisfaction/AverageScorePerDimensionTrendChart/utils'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import useAppSelector from 'hooks/useAppSelector'
import { getAllAgentsJS } from 'state/agents/selectors'
import { getIntegrations } from 'state/integrations/selectors'

const V1DIMENSION = TicketDimension.Channel
const V2DIMENSION = 'channel'

export const AverageScorePerChannelMetric = () => {
    const migrationStage = useGetNewStatsFeatureFlagMigration(
        METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_CHANNEL_TIME_SERIES,
    )
    const isV2 = migrationStage === 'complete' || migrationStage === 'live'
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()
    const useMetricQuery = getMetricQuery(V1DIMENSION)
    const integrations = useAppSelector(getIntegrations)
    const agents = useAppSelector(getAllAgentsJS)

    const getAgentDetails = useCallback(
        (id: number) => agents.find((agent) => agent.id === id),
        [agents],
    )

    const { isFetching, data, isError } = useMetricQuery(
        cleanStatsFilters,
        userTimezone,
        granularity,
    )

    const {
        dataToRender,
        initialVisibility,
        labels = [],
        tooltips = [],
    } = useMemo(
        () =>
            getFormattedInfo({
                dimension: isV2 ? V2DIMENSION : V1DIMENSION,
                data,
                integrations,
                getAgentDetails,
            }),
        [data, getAgentDetails, integrations, isV2],
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
