import React, { useState } from 'react'

import ChartCard from 'pages/stats/ChartCard'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import VoiceCallDirectionFilter from 'pages/stats/voice/components/VoiceCallDirectionFilter/VoiceCallDirectionFilter'
import { VoiceCallTable } from 'pages/stats/voice/components/VoiceCallTable/VoiceCallTable'
import { CALL_LIST_TITLE } from 'pages/stats/voice/constants/voiceOverview'
import { useNewVoiceStatsFilters } from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import { VoiceCallFilterOptions } from 'pages/stats/voice/models/types'

export const VoiceCallTableChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const [tableFilterOption, setTableFilterOption] = useState(
        VoiceCallFilterOptions.All,
    )
    const { cleanStatsFilters, userTimezone } = useNewVoiceStatsFilters()

    return (
        <ChartCard
            title={CALL_LIST_TITLE}
            chartId={chartId}
            dashboard={dashboard}
            noPadding
            titleExtra={
                <VoiceCallDirectionFilter
                    onFilterSelect={(option: VoiceCallFilterOptions) =>
                        setTableFilterOption(option)
                    }
                />
            }
        >
            <VoiceCallTable
                statsFilters={cleanStatsFilters}
                userTimezone={userTimezone}
                filterOption={tableFilterOption}
            />
        </ChartCard>
    )
}
