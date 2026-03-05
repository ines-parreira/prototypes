import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'

const overallAutomationRateScope = defineScope({
    scope: MetricScope.OverallAutomationRate,
    measures: ['automationRate'],
    dimensions: [
        'aiAgentSkill',
        'automationFeatureType',
        'channel',
        'orderManagementType',
        'storeIntegrationId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentSkill',
        'automationFeatureType',
        'channel',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: ['eventDatetime'],
})

export const overallAutomationRate = overallAutomationRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_OVERALL_AUTOMATION_RATE)
    .defineQuery(() => ({
        measures: ['automationRate'],
    }))

export const overallAutomationRateQueryFactoryV2 = (ctx: Context) =>
    overallAutomationRate.build(ctx)

export const aiAgentAutomationRate = overallAutomationRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_AUTOMATION_RATE)
    .defineQuery(({ ctx, config }) => ({
        measures: ['automationRate'],
        filters: createScopeFilters(
            {
                ...ctx.filters,
                automationFeatureType: withLogicalOperator([
                    AutomationFeatureType.AiAgent,
                ]),
            },
            config,
        ),
    }))

export const aiAgentAutomationRateQueryFactoryV2 = (ctx: Context) =>
    aiAgentAutomationRate.build(ctx)

export const automationRatePerFeature = overallAutomationRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_AUTOMATION_RATE_PER_FEATURE)
    .defineQuery(() => ({
        measures: ['automationRate'],
        dimensions: ['automationFeatureType'],
    }))

export const automationRatePerFeatureQueryFactoryV2 = (ctx: Context) =>
    automationRatePerFeature.build(ctx)
