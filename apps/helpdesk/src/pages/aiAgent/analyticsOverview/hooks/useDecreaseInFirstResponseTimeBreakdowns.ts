import { createMetricPerDimensionHooks } from 'domains/reporting/hooks/useStatsMetricPerDimension'
import {
    overallDecreaseInFirstResponseTimePerFeatureQueryV2Factory,
    overallDecreaseInFirstResponseTimePerFlowsQueryV2Factory,
    overallDecreaseInFirstResponseTimePerOrderManagementTypeQueryV2Factory,
} from 'domains/reporting/models/scopes/overallDecreaseInFirstResponseTime'

export const {
    use: useDecreaseInFirstResponseTimePerFeature,
    fetch: fetchDecreaseInFirstResponseTimePerFeature,
} = createMetricPerDimensionHooks(
    overallDecreaseInFirstResponseTimePerFeatureQueryV2Factory,
    ['automationFeatureType'],
)

export const {
    use: useDecreaseInFirstResponseTimePerFlows,
    fetch: fetchDecreaseInFirstResponseTimePerFlows,
} = createMetricPerDimensionHooks(
    overallDecreaseInFirstResponseTimePerFlowsQueryV2Factory,
    ['flowId'],
)

export const {
    use: useDecreaseInFirstResponseTimePerOrderManagementType,
    fetch: fetchDecreaseInFirstResponseTimePerOrderManagementType,
} = createMetricPerDimensionHooks(
    overallDecreaseInFirstResponseTimePerOrderManagementTypeQueryV2Factory,
    ['orderManagementType'],
)
