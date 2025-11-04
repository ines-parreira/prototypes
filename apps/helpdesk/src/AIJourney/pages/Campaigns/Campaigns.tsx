import { Box, Card, Heading } from '@gorgias/axiom'

import { useCampaignContext } from 'AIJourney/providers'

import CampaignsTable from '../../components/CampaignsTable/CampaignsTable'
import { columns } from '../../components/CampaignsTable/Columns'

import css from './Campaigns.less'

export const Campaigns = () => {
    const { isLoading, campaigns } = useCampaignContext()

    return (
        <Box m="md" flexDirection="column" className={css.container}>
            <Card gap="md">
                <Heading size="md">Campaigns</Heading>
                <CampaignsTable
                    columns={columns}
                    data={campaigns || []}
                    isLoading={isLoading}
                />
            </Card>
        </Box>
    )
}
