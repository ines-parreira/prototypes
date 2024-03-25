import React, {useCallback, useEffect, useMemo, useState} from 'react'

import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import classnames from 'classnames'
import {Link, useParams} from 'react-router-dom'
import {Map} from 'immutable'
import PageHeader from 'pages/common/components/PageHeader'

import {
    CONVERT_ROUTE_PARAM_NAME,
    CONVERT_ROUTE_TEMPLATE_PARAM_NAME,
} from 'pages/convert/common/constants'
import {ConvertRouteTemplateParams} from 'pages/convert/common/types'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {toJS} from 'utils'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationById} from 'state/integrations/selectors'
import {CAMPAIGN_TEMPLATES} from 'pages/convert/campaigns/templates'
import history from 'pages/history'
import {chatIsShopifyStore} from 'pages/convert/campaigns/utils/chatIsShopifyStore'
import {CampaignDetailsForm} from 'pages/convert/campaigns/providers/CampaignDetailsForm'
import {getHumanAgentsJS} from 'state/agents/selectors'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {useCreateCampaign} from 'pages/convert/campaigns/hooks/useCreateCampaign'
import {useUpdateCampaign} from 'pages/convert/campaigns/hooks/useUpdateCampaign'
import {getPrimaryLanguageFromChatConfig} from 'config/integrations/gorgias_chat'
import {CampaignListOptions as CampaignListOptionsParams} from 'models/convert/campaign/types'
import {useListCampaigns} from 'models/convert/campaign/queries'
import {CampaignDetailsHeader} from 'pages/convert/campaigns/components/CampaignDetailsHeader'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'

const CampaignTemplateCustomizeView = () => {
    const {
        [CONVERT_ROUTE_PARAM_NAME]: integrationId,
        [CONVERT_ROUTE_TEMPLATE_PARAM_NAME]: templateSlug,
    } = useParams<ConvertRouteTemplateParams>()

    const agents = useAppSelector(getHumanAgentsJS)
    const dispatch = useAppDispatch()

    const template = templateSlug && CAMPAIGN_TEMPLATES[templateSlug]

    const chatIntegrationId = parseInt(integrationId || '')
    const chatIntegration = useAppSelector(
        getIntegrationById(chatIntegrationId)
    )

    const storeIntegration = useAppSelector(
        getIntegrationById(
            chatIntegration.getIn(['meta', 'shop_integration_id'])
        )
    )

    const {channelConnection, isLoading} = useGetOrCreateChannelConnection(
        toJS(chatIntegration)
    )

    const backUrl = useMemo(() => {
        if (channelConnection && channelConnection.is_onboarded) {
            return `/app/convert/${chatIntegrationId}/campaigns`
        }
        return `/app/convert/${chatIntegrationId}/setup/wizard`
    }, [channelConnection, chatIntegrationId])

    const defaultLanguage = useMemo<string>(() => {
        return getPrimaryLanguageFromChatConfig(
            (chatIntegration.get('meta') as Map<string, string>).toJS()
        )
    }, [chatIntegration])

    const campaignListOptions = useMemo(
        () =>
            (channelConnection?.id
                ? {
                      channelConnectionId: channelConnection?.id,
                  }
                : {}) as CampaignListOptionsParams,
        [channelConnection]
    )

    const {data: campaigns, isLoading: areCampaignsLoading} = useListCampaigns(
        campaignListOptions,
        {
            enabled: !!campaignListOptions.channelConnectionId,
        }
    )

    const [campaign, setCampaign] = useState<Campaign>({} as Campaign)
    const [isTemplateLoading, setIsTemplateLoading] = useState(false)
    useEffect(() => {
        if (template) {
            if (Array.isArray(campaigns)) {
                const campaign = campaigns.find(
                    (c) => c.template_id === template.slug
                )

                if (campaign) {
                    setCampaign(campaign as Campaign)
                }
            }

            setIsTemplateLoading(true)

            template
                .getConfiguration(storeIntegration, chatIntegration)
                .then((draftCampaign) => {
                    draftCampaign.language = defaultLanguage
                    setCampaign(draftCampaign as Campaign)
                    setIsTemplateLoading(false)
                })
                .catch((e) => {
                    console.error(e)
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message:
                                'Failed to load template. Please try again in a few seconds.',
                        })
                    )
                })
        }
    }, [
        campaigns,
        chatIntegration,
        defaultLanguage,
        dispatch,
        storeIntegration,
        template,
    ])

    const {mutateAsync: createCampaign} = useCreateCampaign()
    const {mutateAsync: updateCampaign} = useUpdateCampaign()

    const handleCreateCampaign = useCallback(
        async (campaign: Map<any, any>) => {
            if (!!channelConnection) {
                await createCampaign([
                    undefined,
                    {
                        ...toJS(campaign),
                        channel_connection_id: channelConnection.id,
                    },
                ])
                history.push(backUrl)
            }
        },
        [backUrl, channelConnection, createCampaign]
    )

    const handleUpdateCampaign = useCallback(
        async (campaign: Map<any, any>) => {
            if (!!channelConnection) {
                const campaignData: Campaign = toJS(campaign)
                await updateCampaign([
                    undefined,
                    {
                        campaign_id: campaignData.id,
                        channelConnectionId: channelConnection.id,
                    },
                    campaignData,
                ])
                history.push(backUrl)
            }
        },
        [channelConnection, updateCampaign, backUrl]
    )

    return (
        <div className={classnames('full-width')}>
            <PageHeader
                title={
                    <Breadcrumb>
                        {backUrl && (
                            <BreadcrumbItem>
                                <Link to={backUrl}>Campaigns</Link>
                            </BreadcrumbItem>
                        )}
                        {template && (
                            <BreadcrumbItem>{template.name}</BreadcrumbItem>
                        )}
                    </Breadcrumb>
                }
            />
            <CampaignDetailsForm
                agents={agents}
                campaign={campaign}
                isLoading={
                    isLoading || areCampaignsLoading || isTemplateLoading
                }
                isEditMode={!!campaign.id}
                isShopifyStore={chatIsShopifyStore(chatIntegration)}
                integration={chatIntegration}
                shopifyIntegration={storeIntegration}
                createCampaign={handleCreateCampaign}
                updateCampaign={handleUpdateCampaign}
                backUrl={backUrl}
                header={
                    <CampaignDetailsHeader
                        backToHref={backUrl}
                        title="Back to Campaigns recommendation"
                    />
                }
            />
        </div>
    )
}

export default CampaignTemplateCustomizeView
