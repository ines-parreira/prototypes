import type { SankeyChartData } from '@repo/reporting'

import { usePostStats } from 'domains/reporting/models/queries'
import { channelsVoiceCallOutcomeValueQueryFactoryV2 } from 'domains/reporting/models/scopes/voiceCalls'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

import type { CallOutcomeMeasure } from 'domains/reporting/pages/performance/channels/voice/charts/configurableGraphs/ChannelsVoiceConfigurableGraph/callOutcomeSankey'
import {
    buildCallOutcomeSankeyData,
    CALL_OUTCOME_MEASURES,
} from 'domains/reporting/pages/performance/channels/voice/charts/configurableGraphs/ChannelsVoiceConfigurableGraph/callOutcomeSankey'

type CallOutcomeRow = Record<CallOutcomeMeasure, string | null>

const EMPTY_DATA: SankeyChartData = { nodes: [], links: [] }

export const useChannelsVoiceCallOutcomeSankeyData = (
    filters: StatsFilters,
    timezone: string,
): { data: SankeyChartData; isLoading: boolean } => {
    const { data, isFetching } = usePostStats<
        [CallOutcomeRow],
        SankeyChartData
    >(channelsVoiceCallOutcomeValueQueryFactoryV2({ filters, timezone }), {
        select: (response) => {
            const row = response.data.data?.[0]
            const values = CALL_OUTCOME_MEASURES.reduce(
                (acc, measure) => {
                    const value = row?.[measure]
                    acc[measure] = value != null ? parseFloat(value) : 0
                    return acc
                },
                {} as Record<CallOutcomeMeasure, number>,
            )

            return buildCallOutcomeSankeyData(values)
        },
    })

    return { data: data ?? EMPTY_DATA, isLoading: isFetching }
}
