import type { MetricColumnConfig } from '@repo/reporting'

import { STANDARD_METRIC_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/shared/metricColumns'

export const FLOWS_TABLE = {
    title: 'Flows breakdown',
    description: 'Breakdown of the 5 standard metrics per flow.',
}

export const FLOWS_COLUMNS: MetricColumnConfig[] = STANDARD_METRIC_COLUMNS
