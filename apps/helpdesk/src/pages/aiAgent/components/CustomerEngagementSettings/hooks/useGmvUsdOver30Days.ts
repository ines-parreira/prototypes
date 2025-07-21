import { useMemo } from 'react'

import moment from 'moment'

import { ReportingGranularity } from 'domains/reporting/models/types'
import { useGmvUsdOverTimeSeries } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvUsdOverTimeSeries'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import useAppSelector from 'hooks/useAppSelector'
import { getTimezone } from 'state/currentUser/selectors'

export const useGmvUsdOver30Days = (storeIntegration?: number) => {
    const timezone = useAppSelector(getTimezone) ?? 'UTC'

    const { from, to } = useMemo(() => {
        const now = moment()

        return {
            from: now.clone().subtract(30, 'd').toISOString(),
            to: now.toISOString(),
        }
    }, [])

    const { data, isLoading } = useGmvUsdOverTimeSeries(
        {
            period: {
                end_datetime: to,
                start_datetime: from,
            },
            storeIntegrations:
                storeIntegration !== undefined
                    ? {
                          operator: LogicalOperatorEnum.ONE_OF,
                          values: [storeIntegration],
                      }
                    : undefined,
        },
        timezone,
        ReportingGranularity.Day,
    )

    return {
        data,
        isLoading,
    }
}
