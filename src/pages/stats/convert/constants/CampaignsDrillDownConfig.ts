import { useEnrichedDrillDownData } from 'hooks/reporting/useDrillDownData'
import { EnrichmentFields } from 'models/reporting/types'
import { formatConvertCampaignSalesDrillDownRowData } from 'pages/stats/common/drill-down/DrillDownFormatters'
import { DomainConfig } from 'pages/stats/common/drill-down/DrillDownTableConfig'
import { Domain } from 'pages/stats/common/drill-down/types'
import { CampaignSalesDrillDownTableContent } from 'pages/stats/convert/components/CampaignSalesDrillDownTableContent'
import { DrillDownMetric } from 'state/ui/stats/drillDownSlice'
import { ConvertMetric } from 'state/ui/stats/types'

export const ConvertMetricsConfig = {
    [ConvertMetric.CampaignSalesCount]: {
        showMetric: false,
        domain: Domain.Convert,
    },
}

export const useConvertDrillDownHook = (metricData: DrillDownMetric) =>
    useEnrichedDrillDownData(
        metricData,
        [EnrichmentFields.CustomerIntegrationDataByExternalId],
        formatConvertCampaignSalesDrillDownRowData,
        EnrichmentFields.OrderCustomerId,
    )

export const ConvertDrillDownConfig: DomainConfig<ConvertMetric> = {
    drillDownHook: useConvertDrillDownHook,
    tableComponent: CampaignSalesDrillDownTableContent,
    infoBarObjectType: 'orders',
    isMetricDataDownloadable: true,
    modalTriggerTooltipText: 'Click to view orders',
    metricsConfig: ConvertMetricsConfig,
}
