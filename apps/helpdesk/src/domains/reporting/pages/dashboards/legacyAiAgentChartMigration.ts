export const LEGACY_AI_AGENT_CHART_MIGRATION_MAP: Record<
    string,
    string | null
> = {
    // AutomateOverviewChart → Overview / All Agents
    automation_rate_kpichart: 'revamp-ai_agent_overview-automation_rate_card',
    automated_interactions_kpichart:
        'revamp-ai_agent_overview-automated_interactions_card',
    automation_cost_saved_kpichart: 'revamp-ai_agent_overview-cost_saved_card',
    time_saved_by_agents_kpichart: 'revamp-ai_agent_overview-time_saved_card',
    decrease_in_resolution_time_graph_chart:
        'revamp-ai_agent_overview-decrease_in_resolution_time_card',
    automation_decrease_in_first_response_time_graph_chart:
        'revamp-ai_agent_overview-decrease_in_frt_card',
    automation_rate_graph_chart:
        'revamp-ai_agent_overview-configurable_line_graph',
    automated_interactions_graph_chart:
        'revamp-ai_agent_overview-configurable_line_graph',
    automated_interactions_per_feature_graph_chart:
        'revamp-ai_agent_overview-configurable_line_graph',
    ai_agent_automated_interactions_graph_bar:
        'revamp-ai_agent_all_agents-configurable_line_graph',
    ai_agent_automation_rate_kpichart:
        'revamp-ai_agent_all_agents-automation_rate_card',
    ai_agent_automated_interactions_kpichart:
        'revamp-ai_agent_all_agents-automated_interactions_card',

    // AiSalesAgentChart → Shopping Assistant
    aiSalesTotalSalesConv:
        'revamp-ai_agent_shopping_assistant-automated_interactions_card',
    aiSalesGmv: 'revamp-ai_agent_shopping_assistant-total_sales_card',
    aiSalesGmvInfluenced: null,
    aiSalesRoiRate: null,
    aiSalesGmvInfluencedOverTime:
        'revamp-ai_agent_shopping_assistant-configurable_line_graph',
    aiSalesTotalNumberOfOrders:
        'revamp-ai_agent_shopping_assistant-orders_influenced_card',
    aiSalesAverageOrderValue:
        'revamp-ai_agent_shopping_assistant-average_order_value_card',
    aiSalesTotalProductRecommendations:
        'revamp-ai_agent_shopping_assistant-product_recommendations_card',
    aiSalesProductClickRate:
        'revamp-ai_agent_shopping_assistant-click_through_rate_card',
    aiSalesProductBuyRate:
        'revamp-ai_agent_shopping_assistant-buy_through_rate_card',
    aiSalesProductsTable:
        'revamp-ai_agent_shopping_assistant-top_products_performance_table',
    aiSalesSuccessRate: 'revamp-ai_agent_shopping_assistant-success_rate_card',
    aiSalesConversionRate:
        'revamp-ai_agent_shopping_assistant-conversion_rate_card',
    aiSalesTimeSavedByAgent: null,
    aiSalesDiscountOffered:
        'revamp-ai_agent_shopping_assistant-discounts_offered_card',
    aiSalesDiscountApplied:
        'revamp-ai_agent_shopping_assistant-discount_codes_applied_card',
    aiSalesDiscountRateApplied:
        'revamp-ai_agent_shopping_assistant-discount_usage_card',
    aiSalesAverageDiscount:
        'revamp-ai_agent_shopping_assistant-average_discount_amount_card',

    // AutomateAiAgentsChart (already in LEGACY_REPORTS_CONFIG)
    automate_ai_agent_table: null,
    automate_ai_agent_ticket_distribution: null,
    automate_ai_agent_ticket_insights_field_trend: null,
    automate_ai_agent_custom_fields_ticket_count_breakdown: null,
    automate_ai_agent_automated_interactions_metric:
        'revamp-ai_agent_all_agents-automated_interactions_card',
    automate_ai_agent_automated_interactions_over_time:
        'revamp-ai_agent_all_agents-configurable_line_graph',
}

export function applyChartMigration(
    chartId: string,
    isNewScreensEnabled: boolean,
    isLegacyDisabled: boolean,
): string | null {
    if (!isNewScreensEnabled || !isLegacyDisabled) {
        return chartId
    }
    if (
        Object.prototype.hasOwnProperty.call(
            LEGACY_AI_AGENT_CHART_MIGRATION_MAP,
            chartId,
        )
    ) {
        return LEGACY_AI_AGENT_CHART_MIGRATION_MAP[chartId]
    }
    return chartId
}
