import { useMemo } from 'react'

import moment from 'moment'

import type { WithLogicalOperator } from 'domains/reporting/models/stat/types'

export type FilterType = {
    period: {
        start_datetime: string
        end_datetime: string
    }
    handover?: WithLogicalOperator<string>
}

export const useFilters = () => {
    return useMemo(() => {
        const now = moment()
        const start_datetime = now
            .clone()
            .subtract(28, 'days')
            .startOf('day')
            .toISOString()

        return {
            period: {
                start_datetime,
                end_datetime: now.endOf('day').toISOString(),
            },
        }
    }, [])
}
