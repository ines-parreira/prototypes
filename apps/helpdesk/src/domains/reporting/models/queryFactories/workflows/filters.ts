import { WorkflowDatasetFilterMember } from 'domains/reporting/models/cubes/automate_v2/WorkflowDatasetCube'
import { WorkflowStatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilter,
    ReportingFilterOperator,
} from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

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
