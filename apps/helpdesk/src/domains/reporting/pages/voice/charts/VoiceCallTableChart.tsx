import { useState } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import VoiceCallFilter from 'domains/reporting/pages/voice/components/VoiceCallFilter/VoiceCallFilter'
import { VoiceCallTable } from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTable'
import { CALL_LIST_TITLE } from 'domains/reporting/pages/voice/constants/voiceOverview'
import type { VoiceCallFilterOptions } from 'domains/reporting/pages/voice/models/types'
import { VoiceCallFilterDirection } from 'domains/reporting/pages/voice/models/types'

export const VoiceCallTableChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
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
                <VoiceCallFilter
                    onFilterSelect={(option: VoiceCallFilterOptions) =>
                        setTableFilterOptions(option)
                    }
                />
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
