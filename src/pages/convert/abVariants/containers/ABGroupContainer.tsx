import React, {ReactNode} from 'react'
import {Link, NavLink, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

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
                    <Button intent="secondary">Add Variant</Button>
                    <Button>
                        <ButtonIconLabel icon="play_arrow">
                            Start
                        </ButtonIconLabel>
                    </Button>
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
                <NavLink
                    to={abVariantEditorUrl(
                        integrationId,
                        campaignId,
                        'test-id'
                    )}
                    exact
                >
                    Variant A
                </NavLink>
            </SecondaryNavbar>

            {children}
        </div>
    )
}
