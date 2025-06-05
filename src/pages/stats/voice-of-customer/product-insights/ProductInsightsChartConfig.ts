export enum ProductInsightsChart {
    TotalProductSentimentOverTimeChart = 'total_product_sentiment_over_time_chart',
    ProductInsightsTableChartPlaceholder = 'product_insights_table_chart_placeholder',
    TicketVolumeChartPlaceholder = 'ticket_volume_chart_placeholder',
    TicketVolumeChart = 'ticket_volume_chart',
    TopAIIntentsOverTimeChart = 'top_ai_intents_over_time_chart',
    TopProductsPerIntentChartPlaceholder = 'top_products_per_intent_chart_placeholder',
}

export const ProductInsightsChartConfig = {
    [ProductInsightsChart.TotalProductSentimentOverTimeChart]: {
        title: 'Total product sentiment over time',
        hint: {
            title: 'Product sentiment is derived from tickets and classified as positive or negative after excluding neutral sentiments',
        },
    },
    [ProductInsightsChart.TopAIIntentsOverTimeChart]: {
        title: 'Top AI Intents over time',
        hint: {
            title: 'Top AI classified intents. Sort by specific AI Intents using filters. Read more about intents',
            link: 'https://docs.gorgias.com/en-US/customer-intents-81924',
            linkText: 'here.',
        },
    },
}
