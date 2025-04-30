import { StatsFilters } from 'models/stat/types'
import { TooltipData } from 'pages/stats/types'

export const INTENTS_PER_PAGE = 5

const INTENT_TOPIC_COLUMN_LABEL = 'Intent Topic'
const TICKET_VOLUME_COLUMN_LABEL = 'Ticket Volume'
const DELTA_COLUMN_LABEL = 'Delta'

export enum TopProductsPerIntentColumn {
    Intent = 'top-products-intent',
    Volume = 'top-products-volume',
    Delta = 'top-products-delta',
}

export const columnOrder: TopProductsPerIntentColumn[] = [
    TopProductsPerIntentColumn.Intent,
    TopProductsPerIntentColumn.Volume,
    TopProductsPerIntentColumn.Delta,
]

export const LeadColumn = TopProductsPerIntentColumn.Intent

export const TopProductsPerIntentColumnConfig: Record<
    TopProductsPerIntentColumn,
    {
        title: string
        tooltip: TooltipData
        useData: (
            statsFilters: StatsFilters,
            userTimeZone: string,
            customFieldValueString: string,
            productId?: string,
        ) => {
            value: string
        }
    }
> = {
    [TopProductsPerIntentColumn.Intent]: {
        title: INTENT_TOPIC_COLUMN_LABEL,
        tooltip: {
            title: INTENT_TOPIC_COLUMN_LABEL,
        },
        useData: (
            _: StatsFilters,
            __: string,
            intentId: string,
            productId?: string,
        ) => ({ value: productId ?? intentId }),
    },
    [TopProductsPerIntentColumn.Volume]: {
        title: TICKET_VOLUME_COLUMN_LABEL,
        tooltip: {
            title: TICKET_VOLUME_COLUMN_LABEL,
        },
        useData: () => ({ value: '123' }),
    },
    [TopProductsPerIntentColumn.Delta]: {
        title: DELTA_COLUMN_LABEL,
        tooltip: {
            title: DELTA_COLUMN_LABEL,
        },
        useData: () => ({ value: '34' }),
    },
}

export const IntentsOverTimeMetricConfig: {
    title: string
    hint: TooltipData
} = {
    title: 'Intents over time',
    hint: {
        title: 'Intents over time',
    },
}
