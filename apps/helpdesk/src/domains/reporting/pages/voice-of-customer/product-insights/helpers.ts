import type { ReportingMetricItemValue } from 'domains/reporting/hooks/types'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import {
    LeadColumn,
    TopIntentsColumns,
} from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentConfig'
import { DEFAULT_SORTING_VALUE } from 'domains/reporting/pages/voice-of-customer/constants'

export const formatProductsPerIntentsTableData = (
    data: {
        category: string | null
        value: ReportingMetricItemValue
        prevValue?: ReportingMetricItemValue
    }[],
    intentCustomFieldId: number,
) => {
    return data.map((row) => ({
        entityId: row.category || '',
        value: row.value ? Number(row.value) : 0,
        prevValue: row.prevValue ? Number(row.prevValue) : 0,
        level: 0,
        leadColumn: LeadColumn,
        children: [],
        intentCustomFieldId,
    }))
}

export const getColumnsSortingValue = (column: TopIntentsColumns) => {
    switch (column) {
        case TopIntentsColumns.Intent:
            return TicketCustomFieldsDimension.TicketCustomFieldsValue
        case TopIntentsColumns.TicketVolume:
            return TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
        default:
            return DEFAULT_SORTING_VALUE
    }
}
