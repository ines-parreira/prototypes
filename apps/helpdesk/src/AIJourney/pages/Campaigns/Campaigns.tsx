import { Box, Card, Heading } from '@gorgias/axiom'
import { JourneyTypeEnum } from '@gorgias/convert-client'

import CampaignsTable from 'AIJourney/components/CampaignsTable/CampaignsTable'
import { columns } from 'AIJourney/components/CampaignsTable/Columns'
import { useJourneyContext } from 'AIJourney/providers'
import { useJourneys } from 'AIJourney/queries'

import css from './Campaigns.less'

export const Campaigns = () => {
    const { currentIntegration, isLoadingIntegrations } = useJourneyContext()

    const { data: campaigns, isLoading: isLoadingCampaigns } = useJourneys(
        currentIntegration?.id,
        [JourneyTypeEnum.Campaign],
        {
            enabled: !!currentIntegration?.id,
        },
    )

    return (
        <Box m="md" flexDirection="column" className={css.container}>
            <Card gap="md">
                <Heading size="md">Campaigns</Heading>
                <CampaignsTable
                    columns={columns}
                    data={campaigns || []}
                    isLoading={isLoadingIntegrations || isLoadingCampaigns}
                />
            </Card>
        </Box>
    )
}
