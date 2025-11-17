import { useState } from 'react'

import { useAIAgentInsightsDataset } from 'domains/reporting/hooks/automate/useAIAgentInsightsDataset'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { OrderDirection } from 'models/api/types'

import type { IntentTableColumn } from '../types'

export const useIntentQuery = (
    column: IntentTableColumn,
    shopName: string,
    intentId?: string,
    intentLevel?: number,
    enabled = true,
) => {
    const [direction, setDirection] = useState(OrderDirection.Desc)
    const [field, setField] = useState(column)

    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const queryData = useAIAgentInsightsDataset(
        cleanStatsFilters,
        userTimezone,
        shopName,
        direction,
        intentId,
        intentLevel,
    )

    const isLoading = enabled ? queryData?.isFetching : false
    const data = enabled ? queryData?.data : null

    const sortCallback = () => {
        if (!enabled) return

        setDirection((prevDirection) =>
            field === column
                ? prevDirection === OrderDirection.Asc
                    ? OrderDirection.Desc
                    : OrderDirection.Asc
                : OrderDirection.Desc,
        )
        setField(column)
    }

    return {
        isLoading,
        data,
        sortCallback,
        direction,
        field,
        isOrderedBy: column === field,
    }
}
