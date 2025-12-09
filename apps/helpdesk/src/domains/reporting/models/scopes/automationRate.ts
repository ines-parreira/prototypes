import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const automationRateScope = defineScope({
    scope: MetricScope.AutomationRate,
    measures: ['automationRate', 'aiAgentAutomationRate'],
    filters: ['periodStart', 'periodEnd'],
})

export const overallAutomationRate = automationRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_OVERALL_AUTOMATION_RATE)
    .defineQuery(() => ({
        measures: ['automationRate'] as const,
    }))

export const overallAutomationRateQueryV2Factory = (ctx: Context) =>
    overallAutomationRate.build(ctx)

export const aiAgentAutomationRate = automationRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_AUTOMATION_RATE)
    .defineQuery(() => ({
        measures: ['aiAgentAutomationRate'] as const,
    }))

export const aiAgentAutomationRateQueryV2Factory = (ctx: Context) =>
    aiAgentAutomationRate.build(ctx)
