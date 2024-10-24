import React, {useMemo} from 'react'

import {useParams} from 'react-router-dom'

import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteTemplateParams} from 'pages/convert/common/types'

import CampaignTemplateCustomizeBaseView from './CampaignTemplateCustomizeBaseView'

const CampaignTemplateCustomizeRecommendationsView = () => {
    const {[CONVERT_ROUTE_PARAM_NAME]: integrationId} =
        useParams<ConvertRouteTemplateParams>()

    const chatIntegrationId = parseInt(integrationId || '')

    const backUrl = useMemo<string>(() => {
        return `/app/convert/${chatIntegrationId}/setup/wizard`
    }, [chatIntegrationId])

    return (
        <CampaignTemplateCustomizeBaseView
            backUrl={backUrl}
            backUrlTitle={'Back to Campaigns recommendation'}
        />
    )
}
export default CampaignTemplateCustomizeRecommendationsView
