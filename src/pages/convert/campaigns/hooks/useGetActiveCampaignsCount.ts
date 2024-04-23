import {useMemo} from 'react'
import {isActiveStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'

export const useGetActiveCampaignsCount = (
    campaigns: Campaign[] | undefined
) => {
    return useMemo(() => {
        return (campaigns || []).filter((campaign) =>
            isActiveStatus(campaign.status)
        ).length
    }, [campaigns])
}
