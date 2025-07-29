import moment from 'moment'

import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

export const getTimeFilters = (
    storeIds: number[],
): {
    from: string
    to: string
    filters: {
        period: {
            start_datetime: string
            end_datetime: string
        }
        storeIntegrations?: {
            operator: LogicalOperatorEnum
            values: number[]
        }
    }
} => {
    const now = moment()
    const from = now.clone().subtract(14, 'days').toISOString()
    const to = now.toISOString()

    const filters = {
        period: {
            start_datetime: from,
            end_datetime: to,
        },
        storeIntegrations:
            storeIds.length > 0
                ? {
                      operator: LogicalOperatorEnum.ONE_OF,
                      values: storeIds,
                  }
                : undefined,
    }

    return { from, to, filters }
}
