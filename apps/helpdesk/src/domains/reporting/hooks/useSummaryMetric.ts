import type { UseQueryResult } from '@tanstack/react-query'

import type { QueryReturnType } from 'domains/reporting/hooks/useMetric'
import type { Cubes } from 'domains/reporting/models/cubes'
import { usePostReportingV2 } from 'domains/reporting/models/queries'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type { ReportingQuery } from 'domains/reporting/models/types'

export function useSummaryMetric<
    TCube extends Cubes = Cubes,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    query: ReportingQuery<TCube>,
    queryV2: BuiltQuery<TMeta>,
    enabled: boolean = true,
    refetchInterval: number | undefined = undefined,
): UseQueryResult<Record<TCube['measures'], number | null>, unknown> {
    const currentPeriodMetric = usePostReportingV2<
        QueryReturnType<TCube['measures']>,
        Record<TCube['measures'], number | null>,
        TCube,
        TMeta
    >([query], queryV2, {
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
