import {CampaignTableKeys} from '../types/enums/CampaignTableKeys.enum'
import {CampaignTableContentCell} from '../types/CampaignTableContentCell'

export function getDataFromTableCell(
    cell: CampaignTableContentCell,
    key: CampaignTableKeys
) {
    if (key === CampaignTableKeys.CampaignName) {
        return cell.campaign.name
    }

    return cell.metrics[key] ?? 0
}
