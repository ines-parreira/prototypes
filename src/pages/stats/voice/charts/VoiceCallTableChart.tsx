import React, { useState } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import ChartCard from 'pages/stats/ChartCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import VoiceCallDirectionFilter from 'pages/stats/voice/components/VoiceCallDirectionFilter/VoiceCallDirectionFilter'
import { VoiceCallTable } from 'pages/stats/voice/components/VoiceCallTable/VoiceCallTable'
import { CALL_LIST_TITLE } from 'pages/stats/voice/constants/voiceOverview'
import {
    VoiceCallFilterDirection,
    VoiceCallFilterOptions,
} from 'pages/stats/voice/models/types'

import VoiceCallFilter from '../components/VoiceCallFilter/VoiceCallFilter'

export const VoiceCallTableChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const shouldShowNewUnansweredStatuses = useFlag(
        FeatureFlagKey.ShowNewUnansweredStatuses,
    )

    const [tableFilterOptions, setTableFilterOptions] =
        useState<VoiceCallFilterOptions>({
            direction: VoiceCallFilterDirection.All,
        })
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    return (
        <ChartCard
            title={CALL_LIST_TITLE}
            chartId={chartId}
            dashboard={dashboard}
            noPadding
            titleExtra={
                shouldShowNewUnansweredStatuses ? (
                    <VoiceCallFilter
                        onFilterSelect={(option: VoiceCallFilterOptions) =>
                            setTableFilterOptions(option)
                        }
                    />
                ) : (
                    <VoiceCallDirectionFilter
                        onFilterSelect={(option: VoiceCallFilterOptions) =>
                            setTableFilterOptions(option)
                        }
                    />
                )
            }
        >
            <VoiceCallTable
                statsFilters={cleanStatsFilters}
                userTimezone={userTimezone}
                filterOption={tableFilterOptions}
            />
        </ChartCard>
    )
}
