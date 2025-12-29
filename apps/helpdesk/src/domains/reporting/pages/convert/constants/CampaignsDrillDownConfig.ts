import { useEnrichedDrillDownData } from 'domains/reporting/hooks/useDrillDownData'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { formatConvertCampaignSalesDrillDownRowData } from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import type { DomainConfig } from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import { getDrillDownQuery } from 'domains/reporting/pages/common/drill-down/helpers'
import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import { CampaignSalesDrillDownTableContent } from 'domains/reporting/pages/convert/components/CampaignSalesDrillDownTableContent'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { ConvertMetric } from 'domains/reporting/state/ui/stats/types'

export const ConvertMetricsConfig = {
    [ConvertMetric.CampaignSalesCount]: {
        showMetric: false,
        domain: Domain.Convert,
    },
}

export const useConvertDrillDownHook = (metricData: DrillDownMetric) =>
    useEnrichedDrillDownData(
        getDrillDownQuery(metricData),
        metricData,
        [EnrichmentFields.CustomerIntegrationDataByExternalId],
        formatConvertCampaignSalesDrillDownRowData,
        EnrichmentFields.OrderCustomerId,
    )

export const ConvertDrillDownConfig: DomainConfig<ConvertMetric> = {
    drillDownHook: useConvertDrillDownHook,
    tableComponent: CampaignSalesDrillDownTableContent,
    legacyTableComponent: CampaignSalesDrillDownTableContent,
    infoBarObjectType: 'orders',
    isMetricDataDownloadable: true,
    modalTriggerTooltipText: 'Click to view orders',
    metricsConfig: ConvertMetricsConfig,
}
