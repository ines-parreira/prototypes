import type { CampaignTableContentCell } from 'domains/reporting/pages/convert/types/CampaignTableContentCell'
import { CampaignTableKeys } from 'domains/reporting/pages/convert/types/enums/CampaignTableKeys.enum'

export function getDataFromTableCell(
    cell: CampaignTableContentCell,
    key: CampaignTableKeys,
    variantId?: string,
) {
    if (key === CampaignTableKeys.CampaignName) {
        return cell.campaign.name
    }

    if (key === CampaignTableKeys.CampaignCurrentStatus) {
        return cell.campaign.status
    }

    if (!!variantId) {
        const variantMetrics = cell.variantMetrics[variantId] ?? {}
        return variantMetrics[key] ?? 0
    }

    return cell.metrics[key] ?? 0
}
