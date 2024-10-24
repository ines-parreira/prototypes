import React from 'react'
import {Link, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'

import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'

import CampaignLibrarySection from 'pages/convert/campaigns/components/CampaignLibrarySection'
import TemplateNotFoundBanner from 'pages/convert/campaigns/components/TemplateNotFoundBanner'
import {CAMPAIGN_SECTIONS} from 'pages/convert/campaigns/templates'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'

import css from './CampaignLibraryView.less'

export const CampaginLibaryView = () => {
    const {[CONVERT_ROUTE_PARAM_NAME]: integrationId} =
        useParams<ConvertRouteParams>()

    const chatIntegrationId = parseInt(integrationId || '')

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
                        <BreadcrumbItem>Campaign Library</BreadcrumbItem>
                    </Breadcrumb>
                }
            >
                <Link to={`/app/convert/${integrationId}/campaigns/new`}>
                    <Button intent="secondary">Create Custom Campaign</Button>
                </Link>
            </PageHeader>
            <Container fluid className={css.pageContainer}>
                {CAMPAIGN_SECTIONS.map((campaignSection, index) => (
                    <CampaignLibrarySection
                        key={index}
                        section={campaignSection}
                        integrationId={chatIntegrationId}
                    />
                ))}

                <TemplateNotFoundBanner integrationId={chatIntegrationId} />
            </Container>
        </div>
    )
}

export default CampaginLibaryView
