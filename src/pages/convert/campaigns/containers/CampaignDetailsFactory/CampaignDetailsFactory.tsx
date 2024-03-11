import React, {useCallback, useMemo} from 'react'
import {fromJS, Map} from 'immutable'

import {useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'

import {getAgentsJS} from 'state/agents/selectors'
import {getIntegrationById} from 'state/integrations/selectors'

import {useGetCampaign} from 'models/convert/campaign/queries'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {toJS} from 'utils'
import history from 'pages/history'
import {chatIsShopifyStore} from '../../utils/chatIsShopifyStore'

import {CampaignDetailsForm} from '../../providers/CampaignDetailsForm'

import {Campaign} from '../../types/Campaign'

import {BaseCampaignDetails} from '../BaseCampaignDetails'
import {
    CONVERT_ROUTE_CAMPAIGN_PARAM_NAME,
    CONVERT_ROUTE_PARAM_NAME,
} from '../../../common/constants'
import {ConvertRouteCampaignDetailParams} from '../../../common/types'
import {useUpdateCampaign} from '../../hooks/useUpdateCampaign'
import {useCreateCampaign} from '../../hooks/useCreateCampaign'
import {useDeleteCampaign} from '../../hooks/useDeleteCampaign'
import {duplicateCampaign} from '../../utils/duplicateCampaign'

const CampaignDetailsFactory = (): JSX.Element => {
    const {
        [CONVERT_ROUTE_PARAM_NAME]: integrationId,
        [CONVERT_ROUTE_CAMPAIGN_PARAM_NAME]: campaignId,
    } = useParams<ConvertRouteCampaignDetailParams>()

    const integration = useAppSelector(
        getIntegrationById(parseInt(integrationId))
    )

    const {channelConnection, isLoading: isChannelConnectionLoading} =
        useGetOrCreateChannelConnection(toJS(integration))

    const {data, isLoading: isCampaignLoading} = useGetCampaign(
        {campaign_id: campaignId || ''},
        {enabled: !!campaignId}
    )

    const campaign = useMemo(() => {
        if (data) {
            return fromJS(data) as Map<any, any>
        }
        return fromJS({}) as Map<any, any>
    }, [data])

    const shopify = useAppSelector(
        getIntegrationById(integration.getIn(['meta', 'shop_integration_id']))
    )

    const agents = useAppSelector(getAgentsJS)

    const {mutateAsync: updateCampaign} = useUpdateCampaign()
    const {mutateAsync: createCampaign} = useCreateCampaign()
    const {mutateAsync: deleteCampaign} = useDeleteCampaign()

    const handleCreateCampaign = useCallback(
        async (campaign: Map<any, any>) => {
            if (!!channelConnection) {
                const response = await createCampaign([
                    undefined,
                    {
                        ...toJS(campaign),
                        channel_connection_id: channelConnection.id,
                    },
                ])
                const newCampaign = response?.data as Campaign
                history.push(
                    `/app/convert/${integrationId}/campaigns/${newCampaign?.id}`
                )
            }
        },
        [channelConnection, createCampaign, integrationId]
    )

    const handleUpdateCampaign = useCallback(
        async (campaign: Map<any, any>) => {
            if (!!channelConnection) {
                const campaignData: Campaign = toJS(campaign)
                return await updateCampaign([
                    undefined,
                    {
                        campaign_id: campaignData.id,
                        channelConnectionId: channelConnection.id,
                    },
                    campaignData,
                ])
            }
        },
        [updateCampaign, channelConnection]
    )

    const handleDeleteCampaign = useCallback(async () => {
        if (!!campaignId && !!channelConnection) {
            await deleteCampaign([
                undefined,
                {
                    campaign_id: campaignId,
                    channelConnectionId: channelConnection.id,
                },
            ])
            history.push(
                `/app/convert/${integration.get('id') as string}/campaigns`
            )
        }
    }, [campaignId, channelConnection, deleteCampaign, integration])

    const handleCreateDuplicate = useCallback(
        async (campaign: Map<any, any>) => {
            if (!!channelConnection) {
                const duplicate = duplicateCampaign(
                    toJS(campaign),
                    channelConnection.id
                )
                const response = await createCampaign([undefined, duplicate])
                const newCampaign = response?.data as Campaign
                history.push(
                    `/app/convert/${integrationId}/campaigns/${newCampaign?.id}`
                )
            }
        },
        [createCampaign, channelConnection, integrationId]
    )

    const memoCampaign = useMemo(() => {
        return campaign.toJS() as Campaign
    }, [campaign])

    const isLoading = useMemo(
        () => isChannelConnectionLoading || isCampaignLoading,
        [isChannelConnectionLoading, isCampaignLoading]
    )

    return (
        <BaseCampaignDetails integration={integration} campaign={campaign}>
            <CampaignDetailsForm
                agents={agents}
                campaign={memoCampaign}
                isLoading={isLoading}
                isEditMode={campaignId !== undefined}
                isShopifyStore={chatIsShopifyStore(integration)}
                integration={integration}
                shopifyIntegration={shopify}
                createCampaign={handleCreateCampaign}
                duplicateCampaign={handleCreateDuplicate}
                updateCampaign={handleUpdateCampaign}
                deleteCampaign={handleDeleteCampaign}
            />
        </BaseCampaignDetails>
    )
}

export default CampaignDetailsFactory
