import React, {useCallback, useMemo} from 'react'
import {useParams} from 'react-router-dom'
import {fromJS, Map} from 'immutable'

import {toJS} from 'utils'
import {Label} from 'pages/convert/campaigns/types/CampaignFormConfiguration'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'

import useAppSelector from 'hooks/useAppSelector'

import {getHumanAgentsJS} from 'state/agents/selectors'
import {
    getIntegrationById,
    getIntegrationByIdAndType,
} from 'state/integrations/selectors'
import {useGetCampaign} from 'models/convert/campaign/queries'
import {useUpdateCampaign} from 'pages/convert/campaigns/hooks/useUpdateCampaign'
import {CampaignUpdatePayload} from 'models/convert/campaign/types'
import {IntegrationType} from 'models/integration/constants'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {CampaignStepsKeys} from 'pages/convert/campaigns/types/CampaignSteps'

import {
    CampaignDetailsForm,
    Props as CampaignDetailsFormProps,
} from 'pages/convert/campaigns/providers/CampaignDetailsForm'

import {
    CONVERT_ROUTE_CAMPAIGN_PARAM_NAME,
    CONVERT_ROUTE_PARAM_NAME,
    CONVERT_ROUTING_AB_VARIANT_PARAM_NAME,
} from 'pages/convert/common/constants'
import {ConvertRouteAbVariantParams} from 'pages/convert/common/types'
import {chatIsShopifyStore} from 'pages/convert/campaigns/utils/chatIsShopifyStore'

type Props = {
    isControlVersion: boolean
}

export const ABTestVariantEditPage: React.FC<Props> = (props) => {
    const {isControlVersion} = props

    const {
        [CONVERT_ROUTE_PARAM_NAME]: integrationId,
        [CONVERT_ROUTE_CAMPAIGN_PARAM_NAME]: campaignId,
        [CONVERT_ROUTING_AB_VARIANT_PARAM_NAME]: variantId,
    } = useParams<ConvertRouteAbVariantParams>()

    const integration = useAppSelector(
        getIntegrationById(parseInt(integrationId))
    )

    const {channelConnection} = useGetOrCreateChannelConnection(
        toJS(integration)
    )

    const {data, isLoading: isCampaignLoading} = useGetCampaign(
        {campaign_id: campaignId || ''},
        {enabled: !!campaignId}
    )

    const shopifyIntegration = useAppSelector(
        getIntegrationByIdAndType(
            integration.getIn(['meta', 'shop_integration_id']),
            IntegrationType.Shopify
        )
    )

    const shopify = fromJS(shopifyIntegration || {})

    const agents = useAppSelector(getHumanAgentsJS)

    const {mutateAsync: updateCampaign} = useUpdateCampaign()

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
                    campaignData as CampaignUpdatePayload,
                ])
            }
        },
        [updateCampaign, channelConnection]
    )

    const handleUpdateVariant = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
        async (campaign: Map<any, any>) => {
            // eslint-disable-next-line no-console
            console.log('handleUpdateVariant')
        },
        []
    )

    const handleCreateVariant = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
        async (campaign: Map<any, any>) => {
            // eslint-disable-next-line no-console
            console.log('handleCreateVariant')
        },
        []
    )

    const handleDuplicateVariant = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
        async (campaign: Map<any, any>) => {
            // eslint-disable-next-line no-console
            console.log('handleDuplicateVariant')
        },
        []
    )

    const backUrl = `/app/convert/${integrationId}/campaigns`

    const newCampaign = useMemo(() => {
        const newData = {...data}
        if (newData && !isControlVersion && variantId === undefined) {
            newData.message_text = ''
            newData.message_html = ''
        }
        return newData
    }, [data, variantId, isControlVersion])

    const wizardConfiguration = useMemo(() => {
        return {
            defaultStepOpened: CampaignStepsKeys.Message,
            stepConfiguration: {
                [CampaignStepsKeys.Basics]: {
                    isDisabled: true,
                },
                [CampaignStepsKeys.Audience]: {
                    isDisabled: true,
                },
            },
            labels: {
                [Label.Update]: 'Update Variant',
                [Label.Duplicate]: 'Duplicate Variant',
            },
        }
    }, [])

    let campaignDetailsFormProps: CampaignDetailsFormProps = {
        agents: agents,
        campaign: data as Campaign,
        isLoading: isCampaignLoading,
        isEditMode: true,
        isShopifyStore: chatIsShopifyStore(integration),
        isOverCampaignsLimit: false,
        isCreateDisabled: true,
        integration: integration,
        shopifyIntegration: shopify,
        updateCampaign: handleUpdateCampaign,
        backUrl: backUrl,
        openedStep: CampaignStepsKeys.Message,
    }

    if (!isControlVersion) {
        campaignDetailsFormProps = {
            ...campaignDetailsFormProps,
            campaign: newCampaign as Campaign,
            isEditMode: variantId !== undefined,
            isCreateDisabled: false,
            updateCampaign: handleUpdateVariant,
            createCampaign: handleCreateVariant,
            duplicateCampaign:
                variantId !== undefined ? handleDuplicateVariant : undefined,
            wizardConfiguration: wizardConfiguration,
            allowActivate: false,
        }
    }

    return <CampaignDetailsForm {...campaignDetailsFormProps} />
}

export default ABTestVariantEditPage
