import React, { ReactNode, useCallback, useMemo } from 'react'

import { useDismissFlag } from '@repo/hooks'
import { history } from '@repo/routing'
import { Link, NavLink, useLocation, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { useModalManager } from 'hooks/useModalManager'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import StartABTestModal from 'pages/convert/abVariants/components/StartABTestModal'
import StopABTestModal from 'pages/convert/abVariants/components/StopABTestModal'
import { usePauseABGroup } from 'pages/convert/abVariants/hooks/usePauseABGroup'
import { useStartABGroup } from 'pages/convert/abVariants/hooks/useStartABGroup'
import { useStopABGroup } from 'pages/convert/abVariants/hooks/useStopABGroup'
import { ABVariantModalType } from 'pages/convert/abVariants/types/enums'
import {
    abVariantAddUrl,
    abVariantControlVariantUrl,
    abVariantEditorUrl,
    abVariantsUrl,
} from 'pages/convert/abVariants/urls'
import { generateVariantName } from 'pages/convert/abVariants/utils/generateVariantName'
import { Campaign } from 'pages/convert/campaigns/types/Campaign'
import { CampaignVariant } from 'pages/convert/campaigns/types/CampaignVariant'
import { ABGroupStatus } from 'pages/convert/campaigns/types/enums/ABGroupStatus.enum'
import {
    CONVERT_ROUTE_CAMPAIGN_PARAM_NAME,
    CONVERT_ROUTE_PARAM_NAME,
} from 'pages/convert/common/constants'
import { ConvertRouteAbVariantParams } from 'pages/convert/common/types'

import css from './ABGroupContainer.less'

type Props = {
    children: ReactNode
    campaign: Campaign
}

export const ABGroupContainer: React.FC<Props> = ({
    children,
    campaign,
}): JSX.Element => {
    const {
        [CONVERT_ROUTE_PARAM_NAME]: integrationId,
        [CONVERT_ROUTE_CAMPAIGN_PARAM_NAME]: campaignId,
    } = useParams<ConvertRouteAbVariantParams>()
    const location = useLocation()

    const storageAbVariantModalKey = useMemo(() => {
        return `convert:abVariant:${ABVariantModalType.StartABGroup}`
    }, [])

    const { isDismissed, dismiss } = useDismissFlag(
        storageAbVariantModalKey,
        true,
    )

    const stopModalManager = useModalManager('stopModal')
    const startModalManager = useModalManager('startModal')

    const { mutateAsync: startABGroup, isLoading: isLoadingStartABGroup } =
        useStartABGroup()
    const { mutateAsync: pauseABGroup, isLoading: isLoadingPauseABGroup } =
        usePauseABGroup()
    const { mutateAsync: stopABGroup, isLoading: isLoadingStopABGroup } =
        useStopABGroup()

    const variants = useMemo(() => {
        return (campaign.variants ?? []).map((variant, idx) => {
            return {
                id: variant.id,
                name: generateVariantName(idx),
            }
        })
    }, [campaign])

    const canAddVariant = useMemo<boolean>(() => {
        const statuses: string[] = [ABGroupStatus.Draft]

        if (!campaign.ab_group) {
            return false
        }

        if (campaign.variants && campaign.variants.length >= 2) {
            return false
        }

        return statuses.indexOf(campaign.ab_group.status) >= 0
    }, [campaign])

    const isStartButtonDisabled = useMemo(() => {
        if (campaign.ab_group?.status === ABGroupStatus.Completed) {
            return true
        }

        if (!campaign.variants || campaign.variants?.length < 1) {
            return true
        }

        return false
    }, [campaign])

    const canStartTest = useMemo(() => {
        if (!campaign.ab_group) {
            return false
        }

        const statuses: string[] = [ABGroupStatus.Started]
        return statuses.indexOf(campaign.ab_group?.status) < 0
    }, [campaign])

    const handleAddVariant = () => {
        history.push(abVariantAddUrl(integrationId, campaignId))
    }

    const handleStartABGroup = useCallback(async () => {
        await startABGroup([undefined, { campaign_id: campaign.id }])
    }, [campaign, startABGroup])

    const handlePauseABGroup = useCallback(async () => {
        await pauseABGroup([undefined, { campaign_id: campaign.id }])
    }, [campaign, pauseABGroup])

    const handleStopABGroup = useCallback(
        async (variantId: string | null) => {
            await stopABGroup([
                undefined,
                { campaign_id: campaign.id },
                { winner_variant_id: variantId },
            ])

            stopModalManager.closeModal()
        },
        [stopABGroup, campaign, stopModalManager],
    )

    const onStartClick = () => {
        if (campaign.ab_group?.status === ABGroupStatus.Draft && !isDismissed) {
            startModalManager.openModal()
            return
        }

        handleStartABGroup().catch(() => console.error)
    }

    const onModalSubmit = () => {
        handleStartABGroup()
            .then(() => {
                startModalManager.closeModal()
            })
            .catch(() => console.error)
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/convert/${integrationId}/campaigns`}
                            >
                                Campaigns
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>{campaign.name}</BreadcrumbItem>
                    </Breadcrumb>
                }
            >
                <div className={css.actions}>
                    <Button
                        intent="secondary"
                        isDisabled={!canAddVariant}
                        onClick={handleAddVariant}
                    >
                        Add Variant
                    </Button>
                    {location.pathname.endsWith('/ab-variants') && (
                        <>
                            {campaign.ab_group?.status ===
                                ABGroupStatus.Started && (
                                <>
                                    <Button
                                        intent="secondary"
                                        onClick={handlePauseABGroup}
                                        isLoading={isLoadingPauseABGroup}
                                        leadingIcon="pause"
                                    >
                                        Pause Test
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            stopModalManager.openModal()
                                        }
                                        intent="destructive"
                                        leadingIcon="stop"
                                    >
                                        Stop Test
                                    </Button>
                                </>
                            )}
                            {canStartTest && (
                                <>
                                    <Button
                                        id="start-button"
                                        isDisabled={isStartButtonDisabled}
                                        isLoading={isLoadingStartABGroup}
                                        onClick={onStartClick}
                                        leadingIcon="play_arrow"
                                    >
                                        {campaign.ab_group?.status ===
                                        ABGroupStatus.Paused
                                            ? 'Resume Test'
                                            : 'Start'}
                                    </Button>
                                    {!campaign.variants ||
                                        (campaign.variants?.length < 1 && (
                                            <Tooltip target="start-button">
                                                You need at least 2 variants to
                                                start an A/B test.
                                            </Tooltip>
                                        ))}
                                </>
                            )}
                        </>
                    )}
                </div>
            </PageHeader>

            <SecondaryNavbar>
                <NavLink to={abVariantsUrl(integrationId, campaignId)} exact>
                    Test Settings
                </NavLink>
                <NavLink
                    to={abVariantControlVariantUrl(integrationId, campaignId)}
                    exact
                >
                    Control Variant
                </NavLink>
                {variants.map((variant, idx) => (
                    <NavLink
                        key={idx}
                        to={
                            variant.id
                                ? abVariantEditorUrl(
                                      integrationId,
                                      campaignId,
                                      variant.id,
                                  )
                                : abVariantAddUrl(integrationId, campaignId)
                        }
                        exact
                    >
                        {variant.name}
                    </NavLink>
                ))}
            </SecondaryNavbar>

            {children}

            <StopABTestModal
                isOpen={stopModalManager.isOpen()}
                isLoading={isLoadingStopABGroup}
                variants={campaign.variants as CampaignVariant[]}
                controlVersionId={campaign.id}
                onClose={() => stopModalManager.closeModal()}
                onSubmit={handleStopABGroup}
            />

            <StartABTestModal
                isOpen={startModalManager.isOpen()}
                isLoading={isLoadingStartABGroup}
                isDismissed={isDismissed}
                setIsDismissed={dismiss}
                onClose={() => startModalManager.closeModal()}
                onSubmit={onModalSubmit}
            />
        </div>
    )
}

export default ABGroupContainer
