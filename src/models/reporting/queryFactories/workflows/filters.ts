import { WorkflowDatasetFilterMember } from 'models/reporting/cubes/automate_v2/WorkflowDatasetCube'
import {
    ReportingFilter,
    ReportingFilterOperator,
} from 'models/reporting/types'
import { WorkflowStatsFilters } from 'models/stat/types'
import { formatReportingQueryDate } from 'utils/reporting'

export const workflowDatasetDefaultFilters = (
    filters: WorkflowStatsFilters,
): ReportingFilter[] => [
    {
        member: WorkflowDatasetFilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [formatReportingQueryDate(filters.period.start_datetime)],
    },
    {
        member: WorkflowDatasetFilterMember.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [formatReportingQueryDate(filters.period.end_datetime)],
    },
    {
        member: WorkflowDatasetFilterMember.FlowId,
        operator: ReportingFilterOperator.Equals,
        values: [filters.workflowId],
    },
]
