import type { ColumnDef } from '@gorgias/axiom'

import type {
    MetricColumnConfig,
    MetricLoadingStates,
} from 'pages/aiAgent/analyticsOverview/components/shared/metricColumns'
import {
    buildMetricColumnDefs as buildGenericMetricColumnDefs,
    buildNameColumnDef,
} from 'pages/aiAgent/analyticsOverview/components/shared/metricColumns'
import type { FeatureMetrics } from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'

import css from './PerformanceBreakdownTable.less'

export const PERFORMANCE_BREAKDOWN_TABLE = {
    title: 'Performance breakdown',
    description:
        'Automation performance metrics per feature, including automation rate, automated interactions, handovers, cost saved, and time saved.',
}

export const PERFORMANCE_BREAKDOWN_COLUMNS: MetricColumnConfig[] = [
    {
        accessorKey: 'automationRate',
        label: 'Overall automation rate',
        tooltipTitle: 'Overall automation rate',
        tooltipCaption:
            'The number of interactions automated by all automation features as a % of total customer interactions.',
        metricFormat: 'percent-precision-1',
        loadingStateKeys: ['automationRate'],
    },
    {
        accessorKey: 'automatedInteractions',
        label: 'Automated interactions',
        tooltipTitle: 'Automated interactions',
        tooltipCaption:
            'The number of fully automated interactions solved without any human agent intervention.',
        metricFormat: 'decimal',
        loadingStateKeys: ['automatedInteractions'],
    },
    {
        accessorKey: 'handoverCount',
        label: 'Handover interactions',
        tooltipTitle: 'Handover interactions',
        tooltipCaption:
            "The number of interactions AI Agent transferred to a human because it couldn't confidently resolve the customer's request or because the customer explicitly requested to speak with a human agent.",
        metricFormat: 'decimal',
        loadingStateKeys: ['handovers'],
    },
    {
        accessorKey: 'costSaved',
        label: 'Cost saved',
        tooltipTitle: 'Cost saved',
        tooltipCaption:
            'The estimated amount saved by automating interactions that would have otherwise been handled by agents, based on Helpdesk ticket cost plus the benchmark agent cost of $3.10 per ticket.',
        metricFormat: 'currency-precision-1',
        loadingStateKeys: ['costSaved'],
        showNotAvailable: true,
    },
    {
        accessorKey: 'timeSaved',
        label: 'Time saved by agents',
        tooltipTitle: 'Time saved by agents',
        tooltipCaption:
            'The time agent would have spent resolving customer inquiries without all automation features.',
        metricFormat: 'duration',
        loadingStateKeys: ['automatedInteractions', 'timeSaved'],
        skeletonWidth: '80px',
    },
]

export function buildFeatureColumnDef(): ColumnDef<FeatureMetrics> {
    return buildNameColumnDef<FeatureMetrics>(
        'feature',
        'Feature',
        css.featureName,
    )
}

export function buildMetricColumnDefs(
    loadingStates: MetricLoadingStates,
): ColumnDef<FeatureMetrics>[] {
    return buildGenericMetricColumnDefs<FeatureMetrics>(
        PERFORMANCE_BREAKDOWN_COLUMNS,
        loadingStates,
        (row) => row.feature,
        css.headerWithIcon,
    )
}
