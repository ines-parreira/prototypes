import { useCallback } from 'react'

import { useFormContext, useWatch } from 'react-hook-form'

import {
    Box,
    Card,
    CardHeader,
    Icon,
    Skeleton,
    ToggleField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

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
    const isCustomImageEnabled =
        useWatch({ control, name: 'include_custom_image' }) ?? false

    const isCampaign = journeyType === JOURNEY_TYPES.CAMPAIGN
    const isCustom = journeyType === JOURNEY_TYPES.CUSTOM
    const isWelcome = journeyType === JOURNEY_TYPES.WELCOME
    const isWinBack = journeyType === JOURNEY_TYPES.WIN_BACK

    const shouldRenderIncludeImage = !isCampaign && !isWelcome && !isWinBack
    const hasFollowUps = (maxFollowUpMessages ?? 1) > 1

    const handleFollowUpsToggle = useCallback(
        (enabled: boolean) => {
            setValue('max_follow_up_messages', enabled ? 2 : 1, {
                shouldDirty: true,
            })
        },
        [setValue],
    )

    const handleCustomImageToggle = useCallback(
        (enabled: boolean) => {
            setValue('include_custom_image', enabled, { shouldDirty: true })
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
                    <Box flexDirection="row" alignItems="center" gap="xxs">
                        <ToggleField
                            value={hasFollowUps}
                            onChange={handleFollowUpsToggle}
                            label="Allow follow-ups"
                            aria-label="Allow follow-ups"
                        />
                        <span>
                            <Tooltip delay={0} trigger={<Icon name="info" />}>
                                <TooltipContent title="Nudge shoppers who didn't engage with the first message." />
                            </Tooltip>
                        </span>
                    </Box>
                    {hasFollowUps && (
                        <Box flexDirection="column" gap="sm" width="100%">
                            <NumberOfMessages isV3Architecture />
                            <FollowUpWaitHours fullWidth isV3Architecture />
                        </Box>
                    )}
                </div>
                {shouldRenderIncludeImage && (
                    <div className={css.section}>
                        <IncludeImage
                            journeyType={journeyType}
                            isV3Architecture
                        />
                    </div>
                )}
                {isCampaign && (
                    <div className={`${css.section} ${css.sectionImageUpload}`}>
                        <Box flexDirection="row" alignItems="center" gap="xxs">
                            <ToggleField
                                value={isCustomImageEnabled}
                                onChange={handleCustomImageToggle}
                                label="Include custom image"
                                aria-label="Include custom image"
                            />
                            <span>
                                <Tooltip
                                    delay={0}
                                    trigger={<Icon name="info" />}
                                >
                                    <TooltipContent title="Upload an image to attach to your campaign's first message." />
                                </Tooltip>
                            </span>
                        </Box>
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
