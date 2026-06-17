import type { SankeyChartData } from '@repo/reporting'

import { fetchPostStats, usePostStats } from 'domains/reporting/models/queries'
import { channelsVoiceCallOutcomeValueQueryFactoryV2 } from 'domains/reporting/models/scopes/voiceCalls'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

import type { CallOutcomeRow } from 'domains/reporting/pages/performance/channels/voice/charts/configurableGraphs/ChannelsVoiceConfigurableGraph/callOutcomeSankey'
import {
    buildCallOutcomeSankeyData,
    CALL_OUTCOME_MEASURE_LABELS,
    CALL_OUTCOME_MEASURES,
    parseCallOutcomeValues,
} from 'domains/reporting/pages/performance/channels/voice/charts/configurableGraphs/ChannelsVoiceConfigurableGraph/callOutcomeSankey'

const EMPTY_DATA: SankeyChartData = { nodes: [], links: [] }

export const useChannelsVoiceCallOutcomeSankeyData = (
    filters: StatsFilters,
    timezone: string,
): { data: SankeyChartData; isLoading: boolean } => {
    const { data, isFetching } = usePostStats<
        [CallOutcomeRow],
        SankeyChartData
    >(channelsVoiceCallOutcomeValueQueryFactoryV2({ filters, timezone }), {
        select: (response) =>
            buildCallOutcomeSankeyData(
                parseCallOutcomeValues(response.data.data?.[0]),
            ),
    })

    return { data: data ?? EMPTY_DATA, isLoading: isFetching }
}

export const fetchChannelsVoiceCallOutcomeRows = async (
    filters: StatsFilters,
    timezone: string,
): Promise<{ name: string; value: number }[]> => {
    const response = await fetchPostStats<[CallOutcomeRow]>(
        channelsVoiceCallOutcomeValueQueryFactoryV2({ filters, timezone }),
    )
    const values = parseCallOutcomeValues(response.data.data?.[0])

    return CALL_OUTCOME_MEASURES.map((measure) => ({
        name: CALL_OUTCOME_MEASURE_LABELS[measure],
        value: values[measure],
    }))
}
