import type { PlanName } from '@repo/billing'
import _findLastIndex from 'lodash/findLastIndex'

import { formatDuration } from 'domains/reporting/pages/common/utils'
import { MetricName } from 'domains/reporting/services/constants'

type MetricBaseline = [number, number]

type MetricBaselinePerPlan = Record<PlanName, MetricBaseline>

export const MetricsBaselinesJSON: Record<MetricName, MetricBaselinePerPlan> = {
    messagesPerTicket: {
        Advanced: [4.31, 3.2],
        Basic: [4.68, 3.03],
        Enterprise: [4.59, 3.21],
        Pro: [4.15, 3.1],

        Starter: [4.2, 3.05], // Basic
        Custom: [4.58, 3.2], // Enterprise
        Free: [4.15, 3.1], // Pro
    },
    customerSatisfaction: {
        Advanced: [4.51, 4.85],
        Basic: [4.58, 4.93],
        Enterprise: [4.44, 4.8],
        Pro: [4.56, 4.89],

        Starter: [4.58, 4.93],
        Custom: [4.44, 4.8],
        Free: [4.56, 4.89],
    },
    medianFirstResponseTime: {
        Advanced: [33852, 1040],
        Basic: [48371, 4184],
        Enterprise: [35208, 449],
        Pro: [37719, 2766],

        Starter: [48371, 4184],
        Custom: [35208, 449],
        Free: [37719, 2766],
    },
    humanResponseTimeAfterAiHandoff: {
        Advanced: [33852, 1040],
        Basic: [48371, 4184],
        Enterprise: [35208, 449],
        Pro: [37719, 2766],

        Starter: [48371, 4184],
        Custom: [35208, 449],
        Free: [37719, 2766],
    },
    medianResolutionTime: {
        Advanced: [108012, 4636],
        Basic: [387022, 18310],
        Enterprise: [230035, 2335],
        Pro: [149153, 7866],

        Starter: [387022, 18310],
        Custom: [230035, 2335],
        Free: [149153, 7866],
    },
}

export enum TipQualifier {
    Success = 'success', // Far above average
    LightError = 'light-error', // Below average
    LightSuccess = 'light-success', // Above average
}

const grades = [
    TipQualifier.LightError,
    TipQualifier.LightSuccess,
    TipQualifier.Success,
]

export const tips: Record<MetricName, Record<TipQualifier, string[]>> = {
    [MetricName.MessagesPerTicket]: {
        [TipQualifier.LightError]: [
            'Create a <a href="/app/settings/help-center" target="_blank">knowledge base or FAQ</a> page to point customers to an existing resource',
            'Integrate <a href="/app/settings/integrations" target="_blank">Apps</a> and leverage customer data to ask less questions to resolve an issue',
            'Use a <a href="/app/settings/contact-form/about" target="_blank">Contact Form</a> to gather more up-front information on an inquiry',
        ],
        [TipQualifier.LightSuccess]: [
            'Create an effective escalation workflow for technical issues',
        ],
        [TipQualifier.Success]: [
            'Create an effective escalation workflow for technical issues',
        ],
    },
    [MetricName.CustomerSatisfaction]: {
        [TipQualifier.LightError]: [
            'Reach out to low-scoring customers for deeper feedback',
            'Audit <a href="/app/stats/satisfaction" target="_blank">CSAT scores under 4/5</a> and look for common themes',
            'Focus on the complex inquiries that need human attention the most to improve <a href="/app/stats/satisfaction" target="_blank">CSAT</a>',
        ],
        [TipQualifier.LightSuccess]: [
            'Look for opportunities to improve the customer experience beyond the support agent level',
        ],
        [TipQualifier.Success]: [
            'Take advantage of satisfied customers to ask nicely for a review',
        ],
    },
    [MetricName.MedianFirstResponseTime]: {
        [TipQualifier.LightError]: [
            'Use <a href="/app/tickets/new/public" target="_blank">Views</a> to organize tickets, and prioritize customer service and triage tickets.',
            `Use <a href="/app/settings/ticket-assignment" target="_blank">auto-assignment</a> to route tickets to the correct team faster.`,
            `Create Auto-tag <a href="/app/settings/rules" target="_blank">Rules</a> and route tickets based on channel, language, or other qualities`,
        ],
        [TipQualifier.LightSuccess]: [
            `Use our <a href="/app/automation" target="_blank">AI Agent</a> to its full potential to reduce your FRT.`,
        ],
        [TipQualifier.Success]: [
            'High FRT is often correlated to a lower <a href="/app/stats/satisfaction" target="_blank">CSAT</a> - make sure yours doesn’t drop.',
        ],
    },
    [MetricName.HumanResponseTimeAfterAiHandoff]: {
        [TipQualifier.LightError]: [
            'Use <a href="/app/tickets/new/public" target="_blank">Views</a> to organize tickets, and prioritize customer service and triage tickets.',
            `Use <a href="/app/settings/ticket-assignment" target="_blank">auto-assignment</a> to route tickets to the correct team faster.`,
            `Create Auto-tag <a href="/app/settings/rules" target="_blank">Rules</a> and route tickets based on channel, language, or other qualities`,
        ],
        [TipQualifier.LightSuccess]: [
            `Use our <a href="/app/automation" target="_blank">AI Agent</a> to its full potential to reduce your FRT.`,
        ],
        [TipQualifier.Success]: [
            'High FRT is often correlated to a lower <a href="/app/stats/satisfaction" target="_blank">CSAT</a> - make sure yours doesn’t drop.',
        ],
    },
    [MetricName.MedianResolutionTime]: {
        [TipQualifier.LightError]: [
            `Create <a href="/app/settings/macros" target="_blank">Macros</a> to answer frequently asked questions, and personalize with variables`,
            `Set up automated <a href="/app/settings/rules" target="_blank">Rules</a> to instantly fire a personalized message`,
            'Provide instant answer to easy questions that you receive in high volume.',
        ],
        [TipQualifier.LightSuccess]: [
            'Direct customers to faster resolution channels like <a href="/app/settings/channels/gorgias_chat" target="_blank">Chat</a> or <a href="/app/settings/channels/sms" target="_blank">SMS</a>',
        ],
        [TipQualifier.Success]: [
            'Prioritize decreasing it for high-value tickets (VIPs, escalations, item in cart)',
        ],
    },
}

export interface Tip {
    content: string
    type: TipQualifier
    topTen: string
    average: string
}

function getGrade(gradeIndex: number) {
    return {
        grade: grades[gradeIndex],
    }
}

const higherIsBetterGrade = (baselines: MetricBaseline, value: number) => {
    const gradeIndex = _findLastIndex(baselines, (item) => value > item) + 1
    return getGrade(gradeIndex)
}

const lowerIsBetterGrade = (baselines: MetricBaseline, value: number) => {
    const gradeIndex = _findLastIndex(baselines, (item) => value < item) + 1
    return getGrade(gradeIndex)
}

const getMetricGrader = (metric: MetricName) => {
    switch (metric) {
        case MetricName.CustomerSatisfaction:
            return higherIsBetterGrade
        case MetricName.MedianFirstResponseTime:
        case MetricName.MedianResolutionTime:
        case MetricName.MessagesPerTicket:
        case MetricName.HumanResponseTimeAfterAiHandoff:
            return lowerIsBetterGrade
    }
}

export const formatMetricValue = (metric: MetricName, value: number) => {
    switch (metric) {
        case MetricName.HumanResponseTimeAfterAiHandoff:
        case MetricName.MedianFirstResponseTime:
        case MetricName.MedianResolutionTime:
            return formatDuration(value, 2)
        default:
            return String(value)
    }
}

export const randomIndexGrade = (list: string[]) =>
    list[Math.floor(Math.random() * list.length)]

export const getPerformanceTip = (
    metric: MetricName,
    value: number | null,
    plan: PlanName | null,
): Tip | null => {
    if (!value || !plan) {
        return null
    }

    const baselines = MetricsBaselinesJSON[metric][plan]
    const { grade } = getMetricGrader(metric)(baselines, value)
    const content = randomIndexGrade(tips[metric][grade])

    return {
        content,
        type: grade,
        topTen: formatMetricValue(metric, baselines[baselines.length - 1]),
        average: formatMetricValue(metric, baselines[0]),
    }
}
