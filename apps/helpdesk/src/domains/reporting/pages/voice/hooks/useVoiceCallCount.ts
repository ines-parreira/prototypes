import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import type { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import { voiceCallCountQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import { APIOnlyFilterKey } from 'domains/reporting/models/stat/types'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { CALL_LIST_PAGE_SIZE } from 'domains/reporting/pages/voice/constants/voiceOverview'
import type { VoiceCallDisplayStatus } from 'models/voiceCall/types'

import { withLogicalOperator } from '../../../models/queryFactories/utils'
import { voiceCallsCountQueryFactoryV2 } from '../../../models/scopes/voiceCalls'
import { LogicalOperatorEnum } from '../../common/components/Filter/constants'

export const useVoiceCallCount = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment,
    perPage = CALL_LIST_PAGE_SIZE,
    statusFilter?: VoiceCallDisplayStatus[],
) => {
    const queryV1 = voiceCallCountQueryFactory(
        filters,
        timezone,
        segment,
        statusFilter,
        undefined,
        METRIC_NAMES.VOICE_CALL_COUNT_TABLE,
    )

    const queryV2 = voiceCallsCountQueryFactoryV2(
        {
            filters: {
                ...filters,
                [APIOnlyFilterKey.DisplayStatus]: withLogicalOperator(
                    statusFilter || [],
                    LogicalOperatorEnum.ONE_OF,
                ),
            },
            timezone,
        },
        segment,
    )

    const { data } = useMetric(queryV1, queryV2)

    const total = data?.value || 0

    return {
        total,
        totalPages: Math.ceil(total / perPage),
    }
}
