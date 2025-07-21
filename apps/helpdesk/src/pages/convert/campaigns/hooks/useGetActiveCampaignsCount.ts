import { useMemo } from 'react'

import { Campaign } from 'pages/convert/campaigns/types/Campaign'
import { isActiveStatus } from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'

export const useGetActiveCampaignsCount = (
    campaigns: Campaign[] | undefined,
) => {
    return useMemo(() => {
        return (campaigns || []).filter((campaign) =>
            isActiveStatus(campaign.status),
        ).length
    }, [campaigns])
}
