import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { satisfactionSurveysScope } from 'domains/reporting/models/scopes/satisfactionSurveys'
import type { SatisfactionSurveysContext } from 'domains/reporting/models/scopes/satisfactionSurveys'

export const customerSatisfaction = satisfactionSurveysScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_CUSTOMER_SATISFACTION)
    .defineQuery(() => ({
        measures: ['averageSurveyScore'] as const,
    }))

export const customerSatisfactionQueryV2Factory = (
    ctx: SatisfactionSurveysContext,
) => customerSatisfaction.build(ctx)

export const customerSatisfactionPerAgent = satisfactionSurveysScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_CUSTOMER_SATISFACTION_PER_AGENT,
    )
    .defineQuery(() => ({
        measures: ['averageSurveyScore'] as const,
        dimensions: ['agentId'] as const,
        limit: 10_000,
    }))

export const customerSatisfactionPerAgentQueryV2Factory = (
    ctx: SatisfactionSurveysContext,
) => customerSatisfactionPerAgent.build(ctx)

export const customerSatisfactionPerChannel = satisfactionSurveysScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_CUSTOMER_SATISFACTION_PER_CHANNEL,
    )
    .defineQuery(() => ({
        measures: ['averageSurveyScore'] as const,
        dimensions: ['channel'] as const,
        limit: 10_000,
    }))

export const customerSatisfactionPerChannelQueryV2Factory = (
    ctx: SatisfactionSurveysContext,
) => customerSatisfactionPerChannel.build(ctx)
