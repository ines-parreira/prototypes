import { createMetricPerDimensionHooks } from 'domains/reporting/hooks/useStatsMetricPerDimension'
import {
    overallDecreaseInResolutionTimePerFeatureQueryV2Factory,
    overallDecreaseInResolutionTimePerFlowsQueryV2Factory,
    overallDecreaseInResolutionTimePerOrderManagementTypeQueryV2Factory,
} from 'domains/reporting/models/scopes/overallDecreaseInResolutionTime'

export const {
    use: useDecreaseInResolutionTimePerFeature,
    fetch: fetchDecreaseInResolutionTimePerFeature,
} = createMetricPerDimensionHooks(
    overallDecreaseInResolutionTimePerFeatureQueryV2Factory,
    ['automationFeatureType'],
)

export const {
    use: useDecreaseInResolutionTimePerFlows,
    fetch: fetchDecreaseInResolutionTimePerFlows,
} = createMetricPerDimensionHooks(
    overallDecreaseInResolutionTimePerFlowsQueryV2Factory,
    ['flowId'],
)

export const {
    use: useDecreaseInResolutionTimePerOrderManagementType,
    fetch: fetchDecreaseInResolutionTimePerOrderManagementType,
} = createMetricPerDimensionHooks(
    overallDecreaseInResolutionTimePerOrderManagementTypeQueryV2Factory,
    ['orderManagementType'],
)
