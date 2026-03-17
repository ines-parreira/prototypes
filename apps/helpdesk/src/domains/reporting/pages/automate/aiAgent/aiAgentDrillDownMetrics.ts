/**
 * Leaf-level constants for AI Agent drilldown metric identifiers.
 * Zero upstream imports, breaks the circular dependency:
 *   ReportConfig -> card -> DrillDownTableConfig -> AiAgentDrillDownConfig
 * All consumers import from here instead of using raw string literals.
 */
export const AiAgentDrillDownMetricName = {
    ShoppingAssistantSuccessRateCard: 'shopping_assistant_success_rate_card',
} as const

export type AiAgentDrillDownMetricName =
    (typeof AiAgentDrillDownMetricName)[keyof typeof AiAgentDrillDownMetricName]
