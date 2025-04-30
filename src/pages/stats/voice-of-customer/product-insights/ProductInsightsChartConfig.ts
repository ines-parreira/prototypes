export enum ProductInsightsChart {
    TotalProductSentimentOverTimeChartPlaceholder = 'total_product_sentiment_over_time_chart_placeholder',
    ProductInsightsTableChartPlaceholder = 'product_insights_table_chart_placeholder',
    TicketVolumeChart = 'ticket_volume_chart',
    TopAIIntentsOverTimeChart = 'top_ai_intents_over_time_chart',
    TopProductsPerIntentChartPlaceholder = 'top_products_per_intent_chart_placeholder',
}

export const ProductInsightsChartConfig = {
    [ProductInsightsChart.TopAIIntentsOverTimeChart]: {
        title: 'Top AI Intents over time',
        hint: {
            title: 'Top AI classified intents. Sort by specific AI Intents using filters. Read more about intents',
            link: 'https://docs.gorgias.com/en-US/customer-intents-81924',
            linkText: 'here.',
        },
    },
}
