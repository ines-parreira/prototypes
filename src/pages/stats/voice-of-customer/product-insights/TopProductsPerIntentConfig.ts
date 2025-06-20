import { NestedTableColumnConfig } from 'pages/stats/common/components/Table/TableWithNestedRows'

export const TOP_INTENTS_PER_PAGE = 10

const INTENT_TOPIC_COLUMN_LABEL = 'Intent Topic'
export const TICKET_VOLUME_COLUMN_LABEL = 'Ticket Volume'
const DELTA_COLUMN_LABEL = 'Delta'

export enum TopProductsPerIntentColumn {
    Intent = 'top-products-intent',
    TicketVolume = 'top-products-volume',
    Delta = 'top-products-delta',
}

export const columnOrder: TopProductsPerIntentColumn[] = [
    TopProductsPerIntentColumn.Intent,
    TopProductsPerIntentColumn.TicketVolume,
    TopProductsPerIntentColumn.Delta,
]

export const LeadColumn = TopProductsPerIntentColumn.Intent

export const TopProductsPerIntentColumnConfig: Record<
    TopProductsPerIntentColumn,
    NestedTableColumnConfig
> = {
    [TopProductsPerIntentColumn.Intent]: {
        title: INTENT_TOPIC_COLUMN_LABEL,
        tooltip: {
            title: 'AI classified intent topics. Sort by specific AI Intents using filters. Read more about intents',
            linkText: ' here.',
            link: 'https://docs.gorgias.com/en-US/customer-intents-81924',
        },
        isSortable: true,
    },
    [TopProductsPerIntentColumn.TicketVolume]: {
        title: TICKET_VOLUME_COLUMN_LABEL,
        tooltip: {
            title: 'Number of tickets in relation to intent topic or product over time.',
        },
        isSortable: true,
    },
    [TopProductsPerIntentColumn.Delta]: {
        title: DELTA_COLUMN_LABEL,
        tooltip: {
            title: 'Percentage change in ticket volume over time.',
        },
        isSortable: false,
    },
}
