import {AutomationDatasetMember} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {BillableTicketDatasetMember} from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {getFilterDateRange} from 'utils/reporting'

export const automationDatasetDefaultFilters = (filters: StatsFilters) => [
    {
        member: AutomationDatasetMember.AutomationEventCreatedDatetime,
        operator: ReportingFilterOperator.InDateRange,
        values: getFilterDateRange(filters),
    },
]

export const billableTicketDataseteDefaultFilters = (filters: StatsFilters) => [
    {
        member: BillableTicketDatasetMember.TicketCreatedDatetime,
        operator: ReportingFilterOperator.InDateRange,
        values: getFilterDateRange(filters),
    },
]
