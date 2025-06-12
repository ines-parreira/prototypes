import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    DEFAULT_BADGE_TEXT,
    TREND_BADGE_FORMAT,
} from 'pages/stats/common/components/TrendBadge'
import { formatMetricTrend } from 'pages/stats/common/utils'
import { DEFAULT_SORTING_VALUE } from 'pages/stats/voice-of-customer/product-insights/constants'
import {
    LeadColumn,
    TopProductsPerIntentColumn,
} from 'pages/stats/voice-of-customer/product-insights/TopProductsPerIntentConfig'

export const formatTableData = (
    data: {
        category: string
        value: string | null
        prevValue: string | null
    }[],
    intentCustomFieldId: number,
) => {
    return data.map((row) => ({
        entityId: row.category,
        value: row.value ? Number(row.value) : 0,
        prevValue: row.prevValue ? Number(row.prevValue) : 0,
        level: 0,
        leadColumn: LeadColumn,
        children: [],
        intentCustomFieldId,
    }))
}

export const getColumnsSortingValue = (column: TopProductsPerIntentColumn) => {
    switch (column) {
        case TopProductsPerIntentColumn.Intent:
            return TicketCustomFieldsDimension.TicketCustomFieldsValue
        case TopProductsPerIntentColumn.TicketVolume:
            return TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
        default:
            return DEFAULT_SORTING_VALUE
    }
}

export const formatTrendData = (value?: number, prevValue?: number) => {
    const { formattedTrend, sign = 0 } =
        value != null && prevValue != null
            ? formatMetricTrend(value, prevValue, TREND_BADGE_FORMAT)
            : { formattedTrend: null }

    return {
        trend: formattedTrend || DEFAULT_BADGE_TEXT,
        sign,
    }
}
