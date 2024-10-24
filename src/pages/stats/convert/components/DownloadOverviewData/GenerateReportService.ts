import moment from 'moment'

import {CampaignPreview} from 'models/convert/campaign/types'

import {formatPercentage} from 'pages/common/utils/numbers'
import {CAMPAIGN_TABLE_CELLS} from 'pages/stats/convert/components/CampaignTableStats/constants'
import {CampaignTableKeys} from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'

import {DATE_TIME_FORMAT} from 'services/reporting/constants'

import {createCsv, saveZippedFiles} from 'utils/file'

import {CampaignTableValueFormat} from '../../types/enums/CampaignTableValueFormat.enum'

export interface CampaignPerformanceReportData {
    campaign: CampaignPreview
    metrics: Record<string, string | number>
}

export const saveReport = async (data: CampaignPerformanceReportData[]) => {
    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const cellsWithoutCampaignName = [...CAMPAIGN_TABLE_CELLS].splice(1)

    const exportableData = [
        CAMPAIGN_TABLE_CELLS.map((cell) => cell.title),
        ...data.map((row) => [
            row.campaign.name,
            ...cellsWithoutCampaignName.map((cell) => {
                // Special cases Table Keys
                if (cell.key === CampaignTableKeys.CampaignCurrentStatus) {
                    return row.campaign.status
                }

                if (cell.format === CampaignTableValueFormat.Percentage) {
                    return formatPercentage(
                        (row.metrics[cell.key] as number) ?? 0
                    )
                }

                return row.metrics[cell.key] ?? 0
            }),
        ]),
    ]

    await saveZippedFiles(
        {
            [`performance-${export_datetime}.csv`]: createCsv(exportableData),
        },
        `campaign-performance-${export_datetime}`
    )
}
