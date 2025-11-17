import React, { useMemo } from 'react'

import { useParams } from 'react-router-dom'

import { CONVERT_ROUTE_PARAM_NAME } from 'pages/convert/common/constants'
import type { ConvertRouteTemplateParams } from 'pages/convert/common/types'

import CampaignTemplateCustomizeBaseView from './CampaignTemplateCustomizeBaseView'

const CampaignTemplateCustomizeLibraryView = () => {
    const { [CONVERT_ROUTE_PARAM_NAME]: integrationId } =
        useParams<ConvertRouteTemplateParams>()

    const chatIntegrationId = parseInt(integrationId || '')

    const backUrl = useMemo<string>(() => {
        return `/app/convert/${chatIntegrationId}/campaigns/library`
    }, [chatIntegrationId])

    const successBackUrl = useMemo<string>(() => {
        return `/app/convert/${chatIntegrationId}/campaigns`
    }, [chatIntegrationId])

    return (
        <CampaignTemplateCustomizeBaseView
            backUrl={backUrl}
            successBackUrl={successBackUrl}
            backUrlTitle={'Back to campaigns library'}
        />
    )
}
export default CampaignTemplateCustomizeLibraryView
