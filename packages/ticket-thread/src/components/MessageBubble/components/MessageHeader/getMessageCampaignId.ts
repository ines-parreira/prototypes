export function getMessageCampaignId(meta: unknown): string | null {
    if (!meta || typeof meta !== 'object') return null
    if (!('campaign_id' in meta) || !meta.campaign_id) return null
    const value = meta.campaign_id
    return typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : null
}
