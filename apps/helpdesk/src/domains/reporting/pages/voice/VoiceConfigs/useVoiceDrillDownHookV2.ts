import { useDrillDownDataV2 } from 'domains/reporting/hooks/useDrillDownData'
import { formatVoiceDrillDownRowData } from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import {
    getDrillDownQuery,
    getDrillDownQueryV2,
} from 'domains/reporting/pages/common/drill-down/helpers'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'

export const useVoiceDrillDownHookV2 = (metricData: DrillDownMetric) =>
    useDrillDownDataV2(
        getDrillDownQuery(metricData),
        getDrillDownQueryV2(metricData),
        metricData,
        formatVoiceDrillDownRowData,
    )
