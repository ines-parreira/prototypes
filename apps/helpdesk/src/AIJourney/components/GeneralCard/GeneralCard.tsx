import { useCallback, useEffect, useState } from 'react'

import { useFormContext, useWatch } from 'react-hook-form'

import { Box, Card, CardHeader, Skeleton, ToggleField } from '@gorgias/axiom'

import { JOURNEY_TYPES } from 'AIJourney/constants'
import {
    CampaignName,
    FlowName,
    FollowUpWaitHours,
    ImageUpload,
    IncludeImage,
    NumberOfMessages,
    SenderPhoneNumber,
} from 'AIJourney/formFields'
import type { SetupFormValues } from 'AIJourney/pages/Setup/Setup'
import { useJourneyContext } from 'AIJourney/providers'

import css from './GeneralCard.module.less'

type Props = {
    isFormReady: boolean
    isV3Architecture?: boolean
}

export const GeneralCard = ({
    isFormReady,
    isV3Architecture = false,
}: Props) => {
    const { journeyType } = useJourneyContext()

    const { control, setValue } = useFormContext<SetupFormValues>()
    const maxFollowUpMessages = useWatch({
        control,
        name: 'max_follow_up_messages',
    })
    const uploadedImageAttachment = useWatch({
        control,
        name: 'uploaded_image_attachment',
    })

    const [isCustomImageEnabled, setIsCustomImageEnabled] = useState(
        !!uploadedImageAttachment?.[0],
    )

    useEffect(() => {
        if (uploadedImageAttachment?.[0]) {
            setIsCustomImageEnabled(true)
        }
    }, [uploadedImageAttachment])

    const isCampaign = journeyType === JOURNEY_TYPES.CAMPAIGN
    const isCustom = journeyType === JOURNEY_TYPES.CUSTOM
    const isWelcome = journeyType === JOURNEY_TYPES.WELCOME

    const shouldRenderIncludeImage = !isCampaign && !isWelcome
    const hasFollowUps = (maxFollowUpMessages ?? 1) > 1

    const handleFollowUpsToggle = useCallback(
        (enabled: boolean) => {
            setValue('max_follow_up_messages', enabled ? 2 : 1)
        },
        [setValue],
    )

    const handleCustomImageToggle = useCallback(
        (enabled: boolean) => {
            setIsCustomImageEnabled(enabled)
            if (!enabled) {
                setValue('uploaded_image_attachment', undefined)
            }
        },
        [setValue],
    )

    if (!isFormReady) {
        return (
            <Box flexDirection="column" gap="lg">
                <Skeleton
                    width={isV3Architecture ? undefined : 680}
                    height={200}
                />
            </Box>
        )
    }

    if (isV3Architecture) {
        return (
            <>
                <div className={css.section}>
                    <SenderPhoneNumber />
                </div>
                <div className={css.section}>
                    <ToggleField
                        value={hasFollowUps}
                        onChange={handleFollowUpsToggle}
                        label="Allow follow-ups"
                        aria-label="Allow follow-ups"
                    />
                    {hasFollowUps && (
                        <Box flexDirection="column" gap="sm" width="100%">
                            <NumberOfMessages isV3Architecture />
                            <FollowUpWaitHours fullWidth />
                        </Box>
                    )}
                </div>
                {shouldRenderIncludeImage && (
                    <div className={css.section}>
                        <IncludeImage journeyType={journeyType} />
                    </div>
                )}
                {isCampaign && (
                    <div className={`${css.section} ${css.sectionImageUpload}`}>
                        <ToggleField
                            value={isCustomImageEnabled}
                            onChange={handleCustomImageToggle}
                            label="Include custom image"
                            aria-label="Include custom image"
                        />
                        {isCustomImageEnabled && (
                            <Box flexDirection="column" width="100%">
                                <ImageUpload hideLabel fullWidth />
                            </Box>
                        )}
                    </div>
                )}
            </>
        )
    }

    return (
        <Card gap="lg" width={680}>
            <CardHeader title="General" />
            <Box flexDirection="column" gap="md">
                {isCampaign && <CampaignName />}
                {isCustom && <FlowName />}
                <SenderPhoneNumber />
                <NumberOfMessages />
                <FollowUpWaitHours />
                {shouldRenderIncludeImage && (
                    <IncludeImage journeyType={journeyType} />
                )}
                {isCampaign && <ImageUpload />}
            </Box>
        </Card>
    )
}
