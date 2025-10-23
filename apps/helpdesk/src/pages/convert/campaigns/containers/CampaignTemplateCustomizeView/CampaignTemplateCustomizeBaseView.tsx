import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { history } from '@repo/routing'
import classnames from 'classnames'
import { Map } from 'immutable'
import { Link, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { getPrimaryLanguageFromChatConfig } from 'config/integrations/gorgias_chat'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useListCampaigns } from 'models/convert/campaign/queries'
import {
    CampaignListOptions as CampaignListOptionsParams,
    CampaignUpdatePayload,
} from 'models/convert/campaign/types'
import { GorgiasChatIntegration } from 'models/integration/types'
import PageHeader from 'pages/common/components/PageHeader'
import { useCreateCampaign } from 'pages/convert/campaigns/hooks/useCreateCampaign'
import { useUpdateCampaign } from 'pages/convert/campaigns/hooks/useUpdateCampaign'
import { CampaignDetailsForm } from 'pages/convert/campaigns/providers/CampaignDetailsForm'
import { CAMPAIGN_TEMPLATES } from 'pages/convert/campaigns/templates'
import { Campaign } from 'pages/convert/campaigns/types/Campaign'
import { WizardConfiguration } from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import { chatIsShopifyStore } from 'pages/convert/campaigns/utils/chatIsShopifyStore'
import { HeaderReturnButton } from 'pages/convert/common/components/HeaderReturnButton'
import {
    CONVERT_ROUTE_PARAM_NAME,
    CONVERT_ROUTE_TEMPLATE_PARAM_NAME,
} from 'pages/convert/common/constants'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import { ConvertRouteTemplateParams } from 'pages/convert/common/types'
import { getHumanAgentsJS } from 'state/agents/selectors'
import { getIntegrationById } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { toJS } from 'utils'

type OwnProps = {
    backUrl: string
    successBackUrl?: string
    backUrlTitle: string
}

const CampaignTemplateCustomizeBaseView = ({
    backUrl,
    successBackUrl,
    backUrlTitle,
}: OwnProps) => {
    const ref = useRef<HTMLDivElement>(null)

    const {
        [CONVERT_ROUTE_PARAM_NAME]: integrationId,
        [CONVERT_ROUTE_TEMPLATE_PARAM_NAME]: templateSlug,
    } = useParams<ConvertRouteTemplateParams>()

    const agents = useAppSelector(getHumanAgentsJS)
    const dispatch = useAppDispatch()

    const template = templateSlug && CAMPAIGN_TEMPLATES[templateSlug]

    const chatIntegrationId = parseInt(integrationId || '')
    const chatIntegration = useAppSelector(
        getIntegrationById(chatIntegrationId),
    )
    const gorgiasChatIntegration =
        chatIntegration.toJS() as GorgiasChatIntegration

    const storeIntegration = useAppSelector(
        getIntegrationById(
            chatIntegration.getIn(['meta', 'shop_integration_id']),
        ),
    )

    const { channelConnection, isLoading } = useGetOrCreateChannelConnection(
        gorgiasChatIntegration,
    )

    const defaultLanguage = useMemo<string>(() => {
        return getPrimaryLanguageFromChatConfig(gorgiasChatIntegration.meta)
    }, [gorgiasChatIntegration])

    const campaignListOptions = useMemo(
        () =>
            (channelConnection?.id
                ? {
                      channelConnectionId: channelConnection?.id,
                  }
                : {}) as CampaignListOptionsParams,
        [channelConnection],
    )

    const { data: campaigns, isLoading: areCampaignsLoading } =
        useListCampaigns(campaignListOptions, {
            enabled: !!campaignListOptions.channelConnectionId,
        })

    useEffect(() => {
        if (!ref.current) {
            return
        }

        // scroll to top
        ref.current?.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }, [ref])

    const [campaign, setCampaign] = useState<Campaign>({} as Campaign)
    const [isTemplateLoading, setIsTemplateLoading] = useState(false)
    useEffect(() => {
        if (template) {
            if (Array.isArray(campaigns)) {
                const campaign = campaigns.find(
                    (c) => c.template_id === template.slug,
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
                        }),
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

    const wizardConfiguration: WizardConfiguration = useMemo(() => {
        if (template && template?.getWizardConfiguration) {
            return template.getWizardConfiguration()
        }
        return {} as WizardConfiguration
    }, [template])

    const { mutateAsync: createCampaign } = useCreateCampaign()
    const { mutateAsync: updateCampaign } = useUpdateCampaign()

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

                if (template && template.postSave) {
                    const isSuccess = await template.postSave(
                        storeIntegration,
                        chatIntegration,
                    )
                    if (!isSuccess) {
                        void dispatch(
                            notify({
                                status: NotificationStatus.Error,
                                message:
                                    'Failed to create discount code. Please try again in a few seconds.',
                            }),
                        )
                    }
                }

                history.push(successBackUrl ?? backUrl)
            }
        },
        [
            backUrl,
            successBackUrl,
            channelConnection,
            createCampaign,
            storeIntegration,
            chatIntegration,
            template,
            dispatch,
        ],
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
                    campaignData as CampaignUpdatePayload,
                ])
                history.push(backUrl)
            }
        },
        [channelConnection, updateCampaign, backUrl],
    )

    return (
        <div ref={ref} className={classnames('full-width')}>
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
                wizardConfiguration={wizardConfiguration}
                isEditMode={!!campaign.id}
                isShopifyStore={chatIsShopifyStore(chatIntegration)}
                integration={chatIntegration}
                shopifyIntegration={storeIntegration}
                createCampaign={handleCreateCampaign}
                updateCampaign={handleUpdateCampaign}
                backUrl={backUrl}
                header={
                    <HeaderReturnButton
                        backToHref={backUrl}
                        title={backUrlTitle}
                    />
                }
            />
        </div>
    )
}

export default CampaignTemplateCustomizeBaseView
