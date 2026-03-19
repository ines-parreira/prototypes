import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { Box, Card, CardHeader, Skeleton } from '@gorgias/axiom'

import { JOURNEY_TYPES } from 'AIJourney/constants'
import {
    CampaignName,
    ImageUpload,
    IncludeImage,
    NumberOfMessages,
    SenderPhoneNumber,
} from 'AIJourney/formFields'
import { useJourneyContext } from 'AIJourney/providers'

export const GeneralCard = ({ isFormReady }: { isFormReady: boolean }) => {
    const { journeyType } = useJourneyContext()

    const isCampaign = journeyType === JOURNEY_TYPES.CAMPAIGN
    const isWelcome = journeyType === JOURNEY_TYPES.WELCOME
    const campaignImageEnabled = useFlag(
        FeatureFlagKey.AiJourneyCampaignImageEnabled,
    )

    const shouldRenderIncludeImage = !isCampaign && !isWelcome
    const shouldRenderImageUpload = isCampaign && campaignImageEnabled

    if (!isFormReady) {
        return (
            <Box flexDirection="column" gap="lg">
                <Skeleton width={680} height={200} />
            </Box>
        )
    }

    return (
        <Card gap="lg" width={680}>
            <CardHeader title="General" />
            <Box flexDirection="column" gap="md">
                {isCampaign && <CampaignName />}
                <SenderPhoneNumber />
                {!isCampaign && <NumberOfMessages />}
                {shouldRenderIncludeImage && (
                    <IncludeImage journeyType={journeyType} />
                )}
                {shouldRenderImageUpload && <ImageUpload />}
            </Box>
        </Card>
    )
}
