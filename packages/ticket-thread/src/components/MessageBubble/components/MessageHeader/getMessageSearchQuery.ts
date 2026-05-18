export function getMessageSearchQuery(meta: unknown): string | null {
    if (!meta || typeof meta !== 'object') return null
    if (!('ai_campaign_id' in meta) || !meta.ai_campaign_id) return null
    if (
        !('ai_campaign_trigger_operator' in meta) ||
        meta.ai_campaign_trigger_operator !== 'aiSalesAgentHelpOnSearch'
    )
        return null
    if (!('ai_campaign_trigger_value' in meta)) return null
    const value = meta.ai_campaign_trigger_value
    return typeof value === 'string' && value.length > 0 ? value : null
}
