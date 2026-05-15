import { useCallback, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

import {
    Box,
    Button,
    Heading,
    Skeleton,
    Text,
    ToggleField,
} from '@gorgias/axiom'
import {
    JourneyCampaignStateEnum,
    JourneyStatusEnum,
} from '@gorgias/convert-client'

import { ExecutionModeCard } from 'AIJourney/components/ExecutionModeCard/ExecutionModeCard'
import { ImageDropzone } from 'AIJourney/components/ImageDropzone/ImageDropzone'
import { JourneyStateBadge } from 'AIJourney/components/JourneysTable/JourneyStateBadge/JourneyStateBadge'
import { StaticTimingContent } from 'AIJourney/components/StaticTimingContent/StaticTimingContent'
import { JOURNEY_TYPES } from 'AIJourney/constants'
import {
    AudienceSelect,
    FollowUpWaitHours,
    MaxDiscountCode,
    MessageWithDiscountCode,
    MinutesDelay,
    NumberOfMessages,
    SenderPhoneNumber,
    TargetOrderStatus,
} from 'AIJourney/formFields'
import { WaitingDays } from 'AIJourney/formFields/WaitingDays/WaitingDays'
import {
    useAiJourneyStoreConfiguration,
    useSetupFormInit,
} from 'AIJourney/hooks'
import type { SetupFormValues } from 'AIJourney/pages/Setup/Setup'
import { useJourneyContext } from 'AIJourney/providers'

import css from './JourneyEditorSidePanel.module.less'

export const JourneyEditorSidePanel = () => {
    const { journeyData, journeyType, currentIntegration } = useJourneyContext()
    const { isFormReady } = useSetupFormInit()
    const { storeConfiguration, isLoading: isLoadingStoreConfig } =
        useAiJourneyStoreConfiguration(currentIntegration?.id)
    const storeFallbackMode = isLoadingStoreConfig
        ? undefined
        : (storeConfiguration?.execution_mode_override ?? null)

    const { control, setValue } = useFormContext<SetupFormValues>()

    const [isDetailsView, setIsDetailsView] = useState(true)

    const maxFollowUpMessages = useWatch({
        control,
        name: 'max_follow_up_messages',
    })
    const isDiscountEnabled = useWatch({ control, name: 'offer_discount' })
    const uploadedImageAttachment = useWatch({
        control,
        name: 'uploaded_image_attachment',
    })

    const isAiJourneySegmentsEnabled = useFlag(
        FeatureFlagKey.AiJourneySegmentsUiEnabled,
    )
    const isAiJourneyRcsEnabled = useFlag(FeatureFlagKey.AiJourneyRcsEnable)

    const isCampaign = journeyType === JOURNEY_TYPES.CAMPAIGN
    const isCustom = journeyType === JOURNEY_TYPES.CUSTOM
    const isWelcome = journeyType === JOURNEY_TYPES.WELCOME
    const isPostPurchase = journeyType === JOURNEY_TYPES.POST_PURCHASE
    const isWinBack = journeyType === JOURNEY_TYPES.WIN_BACK
    const isCartAbandonment = journeyType === JOURNEY_TYPES.CART_ABANDONMENT
    const isSessionAbandonment =
        journeyType === JOURNEY_TYPES.SESSION_ABANDONMENT

    const shouldRenderTimingSection = !isCampaign && !isCustom
    const shouldRenderAudienceSection = isCampaign || isAiJourneySegmentsEnabled
    const shouldRenderIncludeImage = !isCampaign && !isWelcome
    const shouldRenderMessageWithDiscountCode = (maxFollowUpMessages ?? 1) > 1

    const hasFollowUps = (maxFollowUpMessages ?? 1) > 1
    const [isCustomImageEnabled, setIsCustomImageEnabled] = useState(
        !!uploadedImageAttachment?.[0],
    )

    const displayState = isCampaign
        ? (journeyData?.campaign?.state ?? JourneyCampaignStateEnum.Draft)
        : (journeyData?.state ?? JourneyStatusEnum.Draft)

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

    return (
        <Box flexDirection="row" className={css.sidePanel}>
            {isDetailsView && (
                <div className={css.contentArea}>
                    <div className={css.fields}>
                        <div className={`${css.section} ${css.sectionDetails}`}>
                            <Heading size="lg">Details</Heading>
                            <Box
                                alignItems="center"
                                justifyContent="space-between"
                                className={css.sectionRow}
                            >
                                <Text
                                    size="sm"
                                    color="var(--content-neutral-secondary)"
                                >
                                    Status
                                </Text>
                                <JourneyStateBadge
                                    state={displayState}
                                    isCampaign={isCampaign}
                                />
                            </Box>
                        </div>

                        {!isFormReady ? (
                            <div className={css.section}>
                                <Skeleton height={36} />
                                <Skeleton height={36} />
                                <Skeleton height={36} />
                                <Skeleton height={36} />
                                <Skeleton height={36} />
                            </div>
                        ) : (
                            <>
                                {shouldRenderTimingSection && (
                                    <div className={css.section}>
                                        {(isCartAbandonment ||
                                            isSessionAbandonment ||
                                            isWelcome) && (
                                            <StaticTimingContent
                                                journeyType={
                                                    journeyType as Parameters<
                                                        typeof StaticTimingContent
                                                    >[0]['journeyType']
                                                }
                                            />
                                        )}
                                        {isPostPurchase && (
                                            <>
                                                <TargetOrderStatus />
                                                <MinutesDelay
                                                    journeyType={journeyType}
                                                />
                                            </>
                                        )}
                                        {isWelcome && (
                                            <MinutesDelay
                                                journeyType={journeyType}
                                            />
                                        )}
                                        {isWinBack && (
                                            <>
                                                <WaitingDays type="inactive-days" />
                                                <WaitingDays type="cooldown" />
                                            </>
                                        )}
                                    </div>
                                )}

                                {shouldRenderAudienceSection && (
                                    <div className={css.section}>
                                        <AudienceSelect type="include" />
                                        <AudienceSelect type="exclude" />
                                    </div>
                                )}

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
                                        <Box
                                            flexDirection="column"
                                            className={css.subFields}
                                        >
                                            <NumberOfMessages />
                                            <FollowUpWaitHours />
                                        </Box>
                                    )}
                                </div>

                                <div className={css.section}>
                                    <Controller
                                        name="offer_discount"
                                        control={control}
                                        render={({ field }) => (
                                            <ToggleField
                                                value={field.value}
                                                onChange={field.onChange}
                                                label="Offer discount"
                                                aria-label="Offer discount"
                                            />
                                        )}
                                    />
                                    {isDiscountEnabled && (
                                        <Box
                                            flexDirection="column"
                                            className={css.subFields}
                                        >
                                            <MaxDiscountCode />
                                            {shouldRenderMessageWithDiscountCode && (
                                                <MessageWithDiscountCode />
                                            )}
                                        </Box>
                                    )}
                                </div>

                                {shouldRenderIncludeImage && (
                                    <div className={css.section}>
                                        <Controller
                                            name="include_image"
                                            control={control}
                                            render={({ field }) => (
                                                <ToggleField
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    label="Include image"
                                                    aria-label="Include image"
                                                />
                                            )}
                                        />
                                    </div>
                                )}

                                {isCampaign && (
                                    <div className={css.section}>
                                        <ToggleField
                                            value={isCustomImageEnabled}
                                            onChange={handleCustomImageToggle}
                                            label="Include custom image"
                                            aria-label="Include custom image"
                                        />
                                        {isCustomImageEnabled && (
                                            <Box
                                                flexDirection="column"
                                                className={css.subFields}
                                            >
                                                <Controller
                                                    name="uploaded_image_attachment"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <ImageDropzone
                                                            imageUrl={
                                                                field.value?.[0]
                                                                    ?.url
                                                            }
                                                            onChange={
                                                                field.onChange
                                                            }
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        )}
                                    </div>
                                )}

                                {isAiJourneyRcsEnabled &&
                                    window.USER_IMPERSONATED && (
                                        <div className={css.section}>
                                            <Controller
                                                name="rcs_enabled"
                                                control={control}
                                                render={({ field }) => (
                                                    <ToggleField
                                                        value={field.value}
                                                        onChange={
                                                            field.onChange
                                                        }
                                                        label="RCS enabled"
                                                        aria-label="RCS enabled"
                                                    />
                                                )}
                                            />
                                        </div>
                                    )}
                                {window.USER_IMPERSONATED && (
                                    <div className={css.section}>
                                        <ExecutionModeCard
                                            isFormReady={isFormReady}
                                            storeFallbackMode={
                                                storeFallbackMode
                                            }
                                            collapsible
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className={css.iconBar}>
                <Button
                    variant="tertiary"
                    icon={
                        isDetailsView
                            ? 'system-bar-collapse'
                            : 'system-bar-expand'
                    }
                    aria-label={isDetailsView ? 'Collapse' : 'Expand'}
                    onClick={() => setIsDetailsView((prev) => !prev)}
                />
            </div>
        </Box>
    )
}
