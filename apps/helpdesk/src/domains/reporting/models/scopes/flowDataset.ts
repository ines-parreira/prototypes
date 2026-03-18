import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const flowDatasetScope = defineScope({
    scope: MetricScope.FlowDataset,
    measures: ['dropOffCount', 'handoverInteractionsCount'],
    dimensions: ['channel', 'flowId', 'storeIntegrationId'],
    timeDimensions: ['eventDatetime'],
    filters: ['channel', 'periodEnd', 'periodStart', 'storeIntegrationId'],
    order: [
        'dropOffCount',
        'eventDatetime',
        'flowId',
        'handoverInteractionsCount',
    ],
})

export type FlowDatasetContext = Context<typeof flowDatasetScope.config>

export const flowDatasetHandoverInteractionsPerFlows = flowDatasetScope
    .defineMetricName(METRIC_NAMES.FLOW_DATASET_HANDOVER_INTERACTIONS)
    .defineQuery(() => ({
        measures: ['handoverInteractionsCount'],
        dimensions: ['flowId'],
    }))

export const flowDatasetHandoverInteractionsPerFlowsQueryFactoryV2 = (
    ctx: FlowDatasetContext,
) => flowDatasetHandoverInteractionsPerFlows.build(ctx)
