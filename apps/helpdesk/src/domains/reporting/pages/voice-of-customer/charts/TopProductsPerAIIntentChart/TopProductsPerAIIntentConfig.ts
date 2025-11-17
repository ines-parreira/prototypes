import type { NestedTableColumnConfig } from 'domains/reporting/pages/common/components/Table/TableWithNestedRows'

export const TOP_INTENTS_PER_PAGE = 10

const INTENT_TOPIC_COLUMN_LABEL = 'Intent Topic'
export const TICKET_VOLUME_COLUMN_LABEL = 'Ticket Volume'
const DELTA_COLUMN_LABEL = 'Delta'

export enum TopIntentsColumns {
    Product = 'product',
    Intent = 'intent',
    TicketVolume = 'ticket-volume',
    Delta = 'ticket-delta',
}

export const TopProductsTableColumnsForIntents: TopIntentsColumns[] = [
    TopIntentsColumns.Intent,
    TopIntentsColumns.TicketVolume,
    TopIntentsColumns.Delta,
]

export const TopProductsTableColumnsForProducts: TopIntentsColumns[] = [
    TopIntentsColumns.Product,
    TopIntentsColumns.TicketVolume,
    TopIntentsColumns.Delta,
]

export const LeadColumn = TopIntentsColumns.Intent

export const TopProductsPerIntentColumnConfig: Record<
    TopIntentsColumns,
    NestedTableColumnConfig
> = {
    [TopIntentsColumns.Product]: {
        title: INTENT_TOPIC_COLUMN_LABEL,
        tooltip: {
            title: 'AI classified intent topics. Sort by specific AI Intents using filters. Read more about intents',
            linkText: ' here.',
            link: 'https://docs.gorgias.com/en-US/customer-intents-81924',
        },
        isSortable: true,
    },
    [TopIntentsColumns.Intent]: {
        title: INTENT_TOPIC_COLUMN_LABEL,
        tooltip: {
            title: 'AI classified intent topics. Sort by specific AI Intents using filters. Read more about intents',
            linkText: ' here.',
            link: 'https://docs.gorgias.com/en-US/customer-intents-81924',
        },
        isSortable: true,
    },
    [TopIntentsColumns.TicketVolume]: {
        title: TICKET_VOLUME_COLUMN_LABEL,
        tooltip: {
            title: 'Number of tickets in relation to intent topic or product over time.',
        },
        isSortable: true,
    },
    [TopIntentsColumns.Delta]: {
        title: DELTA_COLUMN_LABEL,
        tooltip: {
            title: 'Percentage change in ticket volume over time.',
        },
        isSortable: false,
    },
}
