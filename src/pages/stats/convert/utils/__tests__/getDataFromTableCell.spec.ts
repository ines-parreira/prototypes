import { campaignVariant } from 'fixtures/campaign'
import {
    CampaignPreview,
    InferredCampaignStatus,
} from 'models/convert/campaign/types'
import { CampaignTableContentCell } from 'pages/stats/convert/types/CampaignTableContentCell'
import { CampaignTableKeys } from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'
import { getDataFromTableCell } from 'pages/stats/convert/utils/getDataFromTableCell'

describe('getDataFromTableCell', () => {
    const campaignName = 'Super conversion campaign name'
    const campaignStatus = InferredCampaignStatus.Active
    const clicksConverted = 124
    const clicksVariantConverted = 234
    const cell = {
        campaign: {
            name: campaignName,
            status: campaignStatus,
        } as CampaignPreview,
        metrics: {
            [CampaignTableKeys.ClicksConverted]: clicksConverted,
        },
        variantMetrics: {
            [campaignVariant.id]: {
                [CampaignTableKeys.ClicksConverted]: clicksVariantConverted,
            },
        },
    } as unknown as CampaignTableContentCell

    it('should return the correct value for CampaignName', () => {
        const result = getDataFromTableCell(
            cell,
            CampaignTableKeys.CampaignName,
        )

        expect(result).toEqual(campaignName)
    })

    it('should return the correct value for CampaignCurrentStatus', () => {
        const result = getDataFromTableCell(
            cell,
            CampaignTableKeys.CampaignCurrentStatus,
        )

        expect(result).toEqual(campaignStatus)
    })

    it('should return the correct value for CampaignId', () => {
        const result = getDataFromTableCell(
            cell,
            CampaignTableKeys.ClicksConverted,
        )

        expect(result).toEqual(clicksConverted)
    })

    it('should return 0 for key not present in data', () => {
        const result = getDataFromTableCell(
            cell,
            CampaignTableKeys.ClicksConversionRate,
        )

        expect(result).toEqual(0)
    })

    it('should return data from variantMetrics', () => {
        const result = getDataFromTableCell(
            cell,
            CampaignTableKeys.ClicksConverted,
            campaignVariant.id,
        )

        expect(result).toEqual(clicksVariantConverted)
    })
})
