import { UseQueryResult } from '@tanstack/react-query'

import { QueryReturnType } from 'domains/reporting/hooks/useMetric'
import { Cubes } from 'domains/reporting/models/cubes'
import { usePostReporting } from 'domains/reporting/models/queries'
import { ReportingQuery } from 'domains/reporting/models/types'

export function useSummaryMetric<TCube extends Cubes = Cubes>(
    query: ReportingQuery<TCube>,
    enabled: boolean = true,
    refetchInterval: number | undefined = undefined,
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
        refetchInterval: refetchInterval,
    })

    return currentPeriodMetric
}
