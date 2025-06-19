import { UseQueryResult } from '@tanstack/react-query'

import { QueryReturnType } from 'hooks/reporting/useMetricTrend'
import { Cubes } from 'models/reporting/cubes'
import { usePostReporting } from 'models/reporting/queries'
import { ReportingQuery } from 'models/reporting/types'

export function useSummaryMetric<TCube extends Cubes = Cubes>(
    query: ReportingQuery<TCube>,
    enabled: boolean = true,
): UseQueryResult<Record<TCube['measures'], number | null>, unknown> {
    const currentPeriodMetric = usePostReporting<
        QueryReturnType<TCube['measures']>,
        Record<TCube['measures'], number | null>,
        TCube
    >([query], {
        enabled,
        select: (data) => {
            const firstItem = data.data.data?.[0]
            let measureKey: TCube['measures']
            const formattedData: Record<TCube['measures'], number | null> =
                {} as Record<TCube['measures'], number | null>

            for (measureKey in firstItem) {
                const dataMeasure = firstItem[measureKey]
                formattedData[measureKey] =
                    dataMeasure !== undefined && dataMeasure !== null
                        ? parseFloat(dataMeasure)
                        : null
            }

            return formattedData
        },
    })

    return currentPeriodMetric
}
