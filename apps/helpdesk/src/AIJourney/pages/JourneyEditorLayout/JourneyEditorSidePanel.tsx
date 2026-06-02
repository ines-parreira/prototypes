import { useEffect, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { Box, Button, Heading, Skeleton, Text } from '@gorgias/axiom'
import {
    JourneyCampaignStateEnum,
    JourneyStatusEnum,
} from '@gorgias/convert-client'

import { AudienceCard } from 'AIJourney/components/AudienceCard/AudienceCard'
import { DiscountCodeCard } from 'AIJourney/components/DiscountCodeCard/DiscountCodeCard'
import { ExecutionModeCard } from 'AIJourney/components/ExecutionModeCard/ExecutionModeCard'
import { GeneralCard } from 'AIJourney/components/GeneralCard/GeneralCard'
import { JourneyStateBadge } from 'AIJourney/components/JourneysTable/JourneyStateBadge/JourneyStateBadge'
import { RcsEnabledCard } from 'AIJourney/components/RcsEnabledCard/RcsEnabledCard'
import { StaticTimingContent } from 'AIJourney/components/StaticTimingContent/StaticTimingContent'
import { JOURNEY_TYPES } from 'AIJourney/constants'
import { MinutesDelay, TargetOrderStatus } from 'AIJourney/formFields'
import { WaitingDays } from 'AIJourney/formFields/WaitingDays/WaitingDays'
import { useAiJourneyStoreConfiguration } from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'

import { KlaviyoSetupCard } from 'AIJourney/components/KlaviyoSetupCard/KlaviyoSetupCard'

import css from './JourneyEditorSidePanel.module.less'

type ActiveView = 'details' | 'webhook'

type Props = {
    isFormReady: boolean
}

export const JourneyEditorSidePanel = ({ isFormReady }: Props) => {
    const { journeyData, journeyType, currentIntegration } = useJourneyContext()
    const { storeConfiguration, isLoading: isLoadingStoreConfig } =
        useAiJourneyStoreConfiguration(currentIntegration?.id)
    const storeFallbackMode = isLoadingStoreConfig
        ? undefined
        : (storeConfiguration?.execution_mode_override ?? null)

    const [activeView, setActiveView] = useState<ActiveView | null>('details')

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

    const webhookUrl = journeyData?.webhook_url ?? undefined
    const hasWebhookUrl = isCustom && !!webhookUrl

    useEffect(() => {
        if (!hasWebhookUrl || !journeyData?.id) return
        const seenKey = `klaviyo-setup-seen-${journeyData.id}`
        if (localStorage.getItem(seenKey)) return
        localStorage.setItem(seenKey, 'true')
        setActiveView('webhook')
    }, [hasWebhookUrl, journeyData?.id])

    const shouldRenderTimingSection = !isCampaign && !isCustom
    const shouldRenderAudienceSection = isCampaign || isAiJourneySegmentsEnabled
    const shouldRenderStaticTiming =
        isCartAbandonment || isSessionAbandonment || isWelcome || isWinBack

    const displayState = isCampaign
        ? (journeyData?.campaign?.state ?? JourneyCampaignStateEnum.Draft)
        : (journeyData?.state ?? JourneyStatusEnum.Draft)

    return (
        <Box flexDirection="row" className={css.sidePanel}>
            {activeView === 'details' && (
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
                                {isCampaign && shouldRenderAudienceSection && (
                                    <div className={css.section}>
                                        <AudienceCard
                                            isFormReady={isFormReady}
                                            isV3Architecture
                                            isAudienceRequired={true}
                                        />
                                    </div>
                                )}

                                {shouldRenderTimingSection && (
                                    <div className={css.section}>
                                        {shouldRenderStaticTiming && (
                                            <StaticTimingContent
                                                journeyType={
                                                    journeyType as Parameters<
                                                        typeof StaticTimingContent
                                                    >[0]['journeyType']
                                                }
                                                isV3Architecture
                                            />
                                        )}
                                        {isPostPurchase && (
                                            <>
                                                <TargetOrderStatus
                                                    isV3Architecture
                                                />
                                                <MinutesDelay
                                                    journeyType={journeyType}
                                                    isV3Architecture
                                                />
                                            </>
                                        )}
                                        {isWelcome && (
                                            <MinutesDelay
                                                journeyType={journeyType}
                                                isV3Architecture
                                            />
                                        )}
                                        {isWinBack && (
                                            <>
                                                <WaitingDays
                                                    type="inactive-days"
                                                    isV3Architecture
                                                />
                                                <WaitingDays
                                                    type="cooldown"
                                                    isV3Architecture
                                                />
                                            </>
                                        )}
                                    </div>
                                )}

                                <GeneralCard
                                    isFormReady={isFormReady}
                                    isV3Architecture
                                />

                                <div className={css.section}>
                                    <DiscountCodeCard
                                        isFormReady={isFormReady}
                                        isV3Architecture
                                    />
                                </div>

                                {!isCampaign && shouldRenderAudienceSection && (
                                    <div className={css.section}>
                                        <AudienceCard
                                            isFormReady={isFormReady}
                                            isV3Architecture
                                            isAudienceRequired={false}
                                        />
                                    </div>
                                )}

                                {isAiJourneyRcsEnabled &&
                                    window.USER_IMPERSONATED && (
                                        <div className={css.section}>
                                            <RcsEnabledCard
                                                isFormReady={isFormReady}
                                                isV3Architecture
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
                                            isV3Architecture
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {activeView === 'webhook' && isCustom && (
                <div className={css.contentArea}>
                    <KlaviyoSetupCard
                        webhookUrl={webhookUrl}
                        isV3Architecture
                    />
                </div>
            )}

            <div className={css.iconBar}>
                <Button
                    variant="tertiary"
                    icon={
                        activeView !== null
                            ? 'system-bar-collapse'
                            : 'system-bar-expand'
                    }
                    aria-label={activeView !== null ? 'Collapse' : 'Expand'}
                    onClick={() =>
                        setActiveView((prev) =>
                            prev !== null ? null : 'details',
                        )
                    }
                />
                <div
                    className={
                        activeView === 'details'
                            ? css.iconButtonActive
                            : undefined
                    }
                >
                    <Button
                        variant="tertiary"
                        icon="list-unordered"
                        aria-label="Details"
                        onClick={() => setActiveView('details')}
                    />
                </div>
                {isCustom && (
                    <div
                        className={
                            activeView === 'webhook'
                                ? css.iconButtonActive
                                : undefined
                        }
                    >
                        <Button
                            variant="tertiary"
                            icon="code"
                            aria-label="Webhook"
                            onClick={() => setActiveView('webhook')}
                        />
                    </div>
                )}
            </div>
        </Box>
    )
}
