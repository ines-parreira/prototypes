export enum TrendOverviewChart {
    TopAIIntentsForProductOverTimeChart = 'top_ai_intents_for_product_over_time_chart',
    PositiveSentimentsPerProductKpiChart = 'positive_sentiments_per_product_kpi_chart',
    NegativeSentimentsPerProductKpiChart = 'negative_sentiments_per_product_kpi_chart',
}

export const TrendOverviewChartConfig = {
    [TrendOverviewChart.TopAIIntentsForProductOverTimeChart]: {
        title: 'Top AI Intents over time',
        hint: {
            title: 'Top AI classified intents. Sort by specific AI Intents using filters. Read more about intents',
            link: 'https://docs.gorgias.com/en-US/customer-intents-81924',
            linkText: 'here.',
        },
    },
    [TrendOverviewChart.PositiveSentimentsPerProductKpiChart]: {
        title: 'Positive sentiments',
        hint: {
            title: 'AI classified positive sentiment including Positive and Promoter categorizations.',
        },
    },
    [TrendOverviewChart.NegativeSentimentsPerProductKpiChart]: {
        title: 'Negative sentiments',
        hint: {
            title: 'AI classified negative sentiment including threatening, negative, and offensive categorizations.',
        },
    },
}
