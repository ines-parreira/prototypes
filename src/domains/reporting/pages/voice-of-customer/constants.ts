import { TicketCustomFieldsDimension } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { TopIntentsColumns } from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentConfig'
import { OrderDirection } from 'models/api/types'

export const PRODUCT_COLUMN_LABEL = 'Product name'
export const FEEDBACK_COLUMN_LABEL = 'Top Product Feedback'
export const NEGATIVE_SENTIMENT_COLUMN_LABEL = 'Negative sentiment'
export const NEGATIVE_SENTIMENT_DELTA_COLUMN_LABEL = 'Negative delta'
export const POSITIVE_SENTIMENT_COLUMN_LABEL = 'Positive sentiment'
export const POSITIVE_SENTIMENT_DELTA_COLUMN_LABEL = 'Positive delta'
export const RETURN_MENTIONS_COLUMN_LABEL = 'Return intentions'
export const TICKETS_VOLUME_COLUMN_LABEL = 'Tickets volume'
export const TICKET_VOLUME_CHART_LABEL = 'Change in ticket volume'
export const TICKET_VOLUME_CHART_TOOLTIP =
    'Ticket quantity and change of ticket volume classified per product'

export const DEFAULT_SORTING_COLUMN = TopIntentsColumns.TicketVolume
export const DEFAULT_SORTING_DIRECTION = OrderDirection.Desc
export const DEFAULT_SORTING_VALUE =
    TicketCustomFieldsDimension.TicketCustomFieldsValue

export const VOICE_OF_CUSTOMER_SECTION_NAME = 'Voice of Customer'
export const VOICE_OF_CUSTOMER_NAVBAR_SECTIONS_KEY = 'voc-navbar-sections'

export enum VoiceOfCustomerViewSections {
    ProductInsights = 'product-insights',
}

export const TREND_OVERVIEW_LABEL = 'Trend Overview'
export const INSIGHTS_LABEL = 'Insights'
