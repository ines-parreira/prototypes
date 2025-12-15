import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { satisfactionSurveysScope } from 'domains/reporting/models/scopes/satisfactionSurveys'
import type { Context } from 'domains/reporting/models/scopes/scope'

export const customerSatisfaction = satisfactionSurveysScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_CUSTOMER_SATISFACTION)
    .defineQuery(() => ({
        measures: ['averageSurveyScore'] as const,
    }))

export const customerSatisfactionQueryV2Factory = (ctx: Context) =>
    customerSatisfaction.build(ctx)

export const customerSatisfactionPerAgent = satisfactionSurveysScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_CUSTOMER_SATISFACTION_PER_AGENT,
    )
    .defineQuery(() => ({
        measures: ['averageSurveyScore'] as const,
        dimensions: ['agentId'] as const,
        limit: 10_000,
    }))

export const customerSatisfactionPerAgentQueryV2Factory = (ctx: Context) =>
    customerSatisfactionPerAgent.build(ctx)

export const customerSatisfactionPerChannel = satisfactionSurveysScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_CUSTOMER_SATISFACTION_PER_CHANNEL,
    )
    .defineQuery(() => ({
        measures: ['averageSurveyScore'] as const,
        dimensions: ['channel'] as const,
        limit: 10_000,
    }))

export const customerSatisfactionPerChannelQueryV2Factory = (ctx: Context) =>
    customerSatisfactionPerChannel.build(ctx)
