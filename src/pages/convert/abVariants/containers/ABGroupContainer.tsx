import React, {ReactNode, useCallback, useMemo} from 'react'
import {Link, NavLink, useParams, useLocation} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {Tooltip} from '@gorgias/ui-kit'

import {usePauseABGroup} from 'pages/convert/abVariants/hooks/usePauseABGroup'
import {useStartABGroup} from 'pages/convert/abVariants/hooks/useStartABGroup'

import {ABGroupStatus} from 'pages/convert/campaigns/types/enums/ABGroupStatus.enum'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {
    CONVERT_ROUTE_PARAM_NAME,
    CONVERT_ROUTE_CAMPAIGN_PARAM_NAME,
} from 'pages/convert/common/constants'
import {ConvertRouteAbVariantParams} from 'pages/convert/common/types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import PageHeader from 'pages/common/components/PageHeader'

import {
    abVariantControlVariantUrl,
    abVariantEditorUrl,
    abVariantsUrl,
} from 'pages/convert/abVariants/urls'

import {generateVariantName} from 'pages/convert/abVariants/utils/generateVariantName'

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

    const {mutateAsync: startABGroup, isLoading: isLoadingStartABGroup} =
        useStartABGroup()
    const {mutateAsync: pauseABGroup, isLoading: isLoadingPauseABGroup} =
        usePauseABGroup()

    const variants = useMemo(() => {
        return (campaign.variants ?? []).map((variant, idx) => {
            return {
                id: variant.id,
                name: generateVariantName(idx),
            }
        })
    }, [campaign])

    const canAddVariant = useMemo<boolean>(() => {
        const statuses: string[] = [ABGroupStatus.Draft, ABGroupStatus.Paused]

        if (!campaign.ab_group) {
            return false
        }

        return statuses.indexOf(campaign.ab_group.status) >= 0
    }, [campaign])

    const isStartButtonDisabled = useMemo(() => {
        if (campaign.ab_group?.status === ABGroupStatus.Completed) {
            return true
        }

        // TODO: Fix me! Set 1 only for easier testing now.
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

    const handleStartABGroup = useCallback(async () => {
        await startABGroup([undefined, {campaign_id: campaign.id}])
    }, [campaign, startABGroup])

    const handlePauseABGroup = useCallback(async () => {
        await pauseABGroup([undefined, {campaign_id: campaign.id}])
    }, [campaign, pauseABGroup])

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
                    {location.pathname.endsWith('/ab-variants') && (
                        <>
                            <Button
                                intent="secondary"
                                isDisabled={!canAddVariant}
                            >
                                Add Variant
                            </Button>
                            {campaign.ab_group?.status ===
                                ABGroupStatus.Started && (
                                <>
                                    <Button
                                        intent="secondary"
                                        onClick={handlePauseABGroup}
                                        isLoading={isLoadingPauseABGroup}
                                    >
                                        <ButtonIconLabel icon="pause">
                                            Pause Test
                                        </ButtonIconLabel>
                                    </Button>
                                    <Button intent="destructive">
                                        <ButtonIconLabel icon="stop">
                                            Stop Test
                                        </ButtonIconLabel>
                                    </Button>
                                </>
                            )}
                            {canStartTest && (
                                <>
                                    <Button
                                        id="start-button"
                                        isDisabled={isStartButtonDisabled}
                                        isLoading={isLoadingStartABGroup}
                                        onClick={handleStartABGroup}
                                    >
                                        <ButtonIconLabel icon="play_arrow">
                                            {campaign.ab_group?.status ===
                                            ABGroupStatus.Paused
                                                ? 'Resume Test'
                                                : 'Start'}
                                        </ButtonIconLabel>
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
                        to={abVariantEditorUrl(
                            integrationId,
                            campaignId,
                            variant.id as string
                        )}
                        exact
                    >
                        {variant.name}
                    </NavLink>
                ))}
            </SecondaryNavbar>

            {children}
        </div>
    )
}

export default ABGroupContainer
