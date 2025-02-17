import {FilterKey, StaticFilter} from 'models/stat/types'

export const AI_SALES_AGENTS_PERSISTENT_FILTERS: StaticFilter[] = [
    FilterKey.Period,
]
export const AI_SALES_AGENTS_OPTIONAL_FILTERS = []

export const AiSalesAgentReportConfig = {
    reportName: 'AI Agents Sales',
    reportFilters: {
        persistent: AI_SALES_AGENTS_PERSISTENT_FILTERS,
        optional: AI_SALES_AGENTS_OPTIONAL_FILTERS,
    },
}
