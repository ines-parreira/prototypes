import _findLastIndex from 'lodash/findLastIndex'
import {formatDuration} from 'pages/stats/common/utils'
import {MetricName, MetricNameToLabelMap} from 'services/reporting/constants'
import {PlanName} from 'utils/paywalls'

type MetricBaseline = [number, number, number, number]

type MetricBaselinePerPlan = Record<PlanName, MetricBaseline>

export const MetricsBaselinesJSON: Record<MetricName, MetricBaselinePerPlan> = {
    messagesPerTicket: {
        Advanced: [5.51, 4.19, 3.81, 3.24],
        Basic: [5.62, 4.13, 3.69, 3.03],
        Enterprise: [6.2, 4.41, 3.98, 3.2],
        Pro: [5.41, 4.1, 3.72, 3.1],
        Starter: [5.62, 4.13, 3.69, 3.03],
        Custom: [6.2, 4.41, 3.98, 3.2],
        Free: [5.41, 4.1, 3.72, 3.1],
    },
    customerSatisfaction: {
        Advanced: [4.09, 4.54, 4.69, 4.86],
        Basic: [4.09, 4.65, 4.78, 4.94],
        Enterprise: [3.94, 4.46, 4.63, 4.82],
        Pro: [4.15, 4.63, 4.74, 4.89],
        Starter: [4.09, 4.65, 4.78, 4.94],
        Custom: [3.94, 4.46, 4.63, 4.82],
        Free: [4.15, 4.63, 4.74, 4.89],
    },
    firstResponseTime: {
        Advanced: [73343, 32604, 11936, 982],
        Basic: [84246, 45764, 23967, 3521],
        Enterprise: [81521, 24163, 10123, 368],
        Pro: [72678, 35614, 16354, 2423],
        Starter: [84246, 45764, 23967, 3521],
        Custom: [81521, 24163, 10123, 368],
        Free: [72678, 35614, 16354, 2423],
    },
    resolutionTime: {
        Advanced: [232821, 68143, 44664, 4799],
        Basic: [467647, 118315, 73483, 17374],
        Enterprise: [252067, 65782, 30853, 1824],
        Pro: [244333, 73408, 52431, 7663],
        Starter: [467647, 118315, 73483, 17374],
        Custom: [252067, 65782, 30853, 1824],
        Free: [244333, 73408, 52431, 7663],
    },
}

export enum TipQualifier {
    Neutral = 'neutral',
    Error = 'error',
    Success = 'success',
    LightError = 'light-error',
    LightSuccess = 'light-success',
}

const grades = [
    TipQualifier.Error,
    TipQualifier.LightError,
    TipQualifier.Neutral,
    TipQualifier.LightSuccess,
    TipQualifier.Success,
]

export const tips: Record<MetricName, Record<TipQualifier, string>> = {
    [MetricName.MessagesPerTicket]: {
        [TipQualifier.Error]:
            'Create a knowledge base or FAQ page to point customers to an existing resource',
        [TipQualifier.LightError]:
            'Integrate Apps and leverage customer data to ask less questions to resolve an issue',
        [TipQualifier.Neutral]:
            'Use a Contact Form to gather more up-front information on an inquiry',
        [TipQualifier.LightSuccess]:
            'Create an effective escalation workflow for technical issues',
        [TipQualifier.Success]:
            'Create an effective escalation workflow for technical issues',
    },
    [MetricName.CustomerSatisfaction]: {
        [TipQualifier.Error]:
            'Reach out to low-scoring customers for deeper feedback',
        [TipQualifier.LightError]:
            'Audit CSAT scores under 4/5 and look for common themes',
        [TipQualifier.Neutral]:
            'Focus on the complex inquiries that need human attention the most to improve CSAT',
        [TipQualifier.LightSuccess]:
            'Look for opportunities to improve the customer experience beyond the support agent level',
        [TipQualifier.Success]:
            'Take advantage of satisfied customers to ask nicely for a review',
    },
    [MetricName.FirstResponseTime]: {
        [TipQualifier.Error]:
            'Use Views to organize tickets, and prioritize customer service and triage tickets.',
        [TipQualifier.LightError]:
            'Use auto-assignment to route tickets to the correct team faster.',
        [TipQualifier.Neutral]:
            'Create Auto-tag Rules and route tickets based on channel, language, or other qualities',
        [TipQualifier.LightSuccess]:
            'Use our Automation Add-on to its full potential to reduce your FRT.',
        [TipQualifier.Success]:
            'High FRT is often correlated to a lower CSAT - make sure yours doesn’t drop.',
    },
    [MetricName.ResolutionTime]: {
        [TipQualifier.Error]:
            'Create <a href="https://gorgias.com/product/macros">Macros</a> to answer frequently asked questions, and personalize with variables',
        [TipQualifier.LightError]:
            'Set up automated Rules to instantly fire a personalized message',
        [TipQualifier.Neutral]:
            'Provide instant answer to easy questions that you receive in high volume.',
        [TipQualifier.LightSuccess]:
            'Direct customers to faster resolution channels like Chat or SMS',
        [TipQualifier.Success]:
            'Prioritize decreasing it for high-value tickets (VIPs, escalations, item in cart)',
    },
}

export const hintTemplates: Record<TipQualifier, string> = {
    [TipQualifier.Error]:
        'You’re underperforming compared to merchants your size. Hit {TARGET} to be on par with them.',
    [TipQualifier.LightError]:
        'You’re underperforming compared to merchants your size. Hit {TARGET} to be on par with them.',
    [TipQualifier.Neutral]:
        'You’re on par with other merchants your size. Hit {TARGET} to start outperforming them.',
    [TipQualifier.LightSuccess]:
        'You’re among the top performing merchants your size. Hit {TARGET} to be among the top 10%!',
    [TipQualifier.Success]:
        'You’re among the top 10% of merchants your size. Keep up the good work!',
}

export const gradeLabels = {
    [TipQualifier.Error]: 'Poor',
    [TipQualifier.LightError]: 'Poor',
    [TipQualifier.Neutral]: 'Average',
    [TipQualifier.LightSuccess]: 'Good',
    [TipQualifier.Success]: 'Excellent',
}

export interface Tip {
    content: string
    hint: string | undefined
    title: string
    type: TipQualifier
}

export const tipNotAvailable = {
    content: 'There is no data available for the selected period.',
    hint: undefined,
    title: 'No data available',
    type: TipQualifier.Neutral,
}

function getGrade(gradeIndex: number, baselines: MetricBaseline) {
    return {
        grade: grades[gradeIndex],
        nextGradeTarget:
            baselines[Math.min(Math.max(gradeIndex, 1), baselines.length - 1)],
    }
}

const higherIsBetterGrade = (baselines: MetricBaseline, value: number) => {
    const gradeIndex = _findLastIndex(baselines, (item) => value > item) + 1
    return getGrade(gradeIndex, baselines)
}

const lowerIsBetterGrade = (baselines: MetricBaseline, value: number) => {
    const gradeIndex = _findLastIndex(baselines, (item) => value < item) + 1
    return getGrade(gradeIndex, baselines)
}

const getMetricGrader = (metric: MetricName) => {
    switch (metric) {
        case MetricName.CustomerSatisfaction:
            return higherIsBetterGrade
        case MetricName.FirstResponseTime:
            return lowerIsBetterGrade
        case MetricName.ResolutionTime:
            return lowerIsBetterGrade
        case MetricName.MessagesPerTicket:
            return lowerIsBetterGrade
    }
}

export const renderHint = (
    template: string,
    metric: MetricName,
    targetValue: number
) => {
    let value
    switch (metric) {
        case MetricName.FirstResponseTime:
        case MetricName.ResolutionTime:
            value = formatDuration(targetValue, 2)
            break
        default:
            value = String(targetValue)
            break
    }

    return template
        .replace('{METRIC}', MetricNameToLabelMap[metric])
        .replace('{TARGET}', value)
}

export const getPerformanceTip = (
    metric: MetricName,
    value: number | null,
    plan: PlanName | null
): Tip => {
    if (!value || !plan) {
        return tipNotAvailable
    }
    const baselines = MetricsBaselinesJSON[metric][plan]
    const {grade, nextGradeTarget} = getMetricGrader(metric)(baselines, value)
    const content = tips[metric][grade]
    const hint = renderHint(hintTemplates[grade], metric, nextGradeTarget)
    return {
        content,
        hint,
        title: gradeLabels[grade],
        type: grade,
    }
}
