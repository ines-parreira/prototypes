import {VariantTableEntry} from 'pages/convert/abVariants/types/VariantTableEntry'
import {CampaignTableKeys} from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'

export function getDataFromTableCell(
    data: VariantTableEntry,
    key: CampaignTableKeys
) {
    return data.metrics[key] ?? 0
}
