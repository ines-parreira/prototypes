import React, {useCallback, useEffect, useMemo} from 'react'

import {Container} from 'reactstrap'
import classnames from 'classnames'
import {Link, useParams} from 'react-router-dom'
import PageHeader from 'pages/common/components/PageHeader'

import Button from 'pages/common/components/button/Button'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'
import {useUpdateChannelConnection} from 'pages/convert/channelConnections/hooks/useUpdateChannelConnection'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {toJS} from 'utils'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationById} from 'state/integrations/selectors'
import {ONBOARDING_CAMPAIGN_TEMPLATES_LIST} from 'pages/convert/campaigns/templates'
import history from 'pages/history'
import {
    Campaign,
    CampaignListOptions as CampaignListOptionsParams,
} from 'models/convert/campaign/types'
import {useListCampaigns} from 'models/convert/campaign/queries'
import {CampaignTemplate} from 'pages/convert/campaigns/templates/types'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import ConvertCampaignTemplate from '../ConvertCampaignTemplate'
import css from './ConvertOnboardingRecommendationsView.less'

const ConvertOnboardingRecommendationsView = () => {
    const {[CONVERT_ROUTE_PARAM_NAME]: integrationId} =
        useParams<ConvertRouteParams>()

    const chatIntegrationId = parseInt(integrationId || '')
    const chatIntegration = useAppSelector(
        getIntegrationById(chatIntegrationId)
    )

    const {channelConnection} = useGetOrCreateChannelConnection(
        toJS(chatIntegration)
    )

    const updateChannelConnection = useUpdateChannelConnection()

    const campaignListOptions = useMemo(
        () =>
            (channelConnection?.id
                ? {
                      channelConnectionId: channelConnection?.id,
                  }
                : {}) as CampaignListOptionsParams,
        [channelConnection]
    )

    const {data: campaigns} = useListCampaigns(campaignListOptions, {
        enabled: !!campaignListOptions.channelConnectionId,
    })

    const isSelected = (template: CampaignTemplate, campaigns?: Campaign[]) =>
        !!campaigns &&
        campaigns.some(
            (c) =>
                c.template_id === template.slug &&
                c.status === CampaignStatus.Active
        )

    const handleFinishSetup = useCallback(async () => {
        if (updateChannelConnection.isLoading) return

        if (!!channelConnection) {
            await updateChannelConnection.mutateAsync([
                undefined,
                {channel_connection_id: channelConnection.id},
                {is_onboarded: true},
            ])
        }
    }, [channelConnection, updateChannelConnection])

    useEffect(() => {
        // Once onboarding is done, redirect user to campaigns
        if (channelConnection?.is_onboarded === true && chatIntegrationId) {
            history.push(`/app/convert/${chatIntegrationId}/campaigns`)
        }
    }, [channelConnection, chatIntegrationId])

    return (
        <div className={classnames('full-width', css.pageWrapper)}>
            <PageHeader title="Convert" />
            <Container fluid className={css.container}>
                <h1 className={css.title}>
                    Here are our recommended campaigns for you:
                </h1>

                <div className={css.description}>
                    Customize campaign messages, and add your discount codes and
                    product recommendations
                </div>

                <div className={css.templatesContainer}>
                    {ONBOARDING_CAMPAIGN_TEMPLATES_LIST.map((template) => (
                        <ConvertCampaignTemplate
                            key={template.slug}
                            template={template}
                            integrationId={chatIntegrationId}
                            selected={isSelected(template, campaigns)}
                        />
                    ))}
                </div>
            </Container>
            <div className={css.footer}>
                <div className={css.footerShadow}></div>
                <div className={css.footerContent}>
                    <Link to={`/app/convert/${integrationId}/setup#later`}>
                        <Button fillStyle="ghost">
                            Save &amp; Customize Later
                        </Button>
                    </Link>

                    <div className={css.wizardButtons}>
                        <Link to={`/app/convert/${integrationId}/setup`}>
                            <Button intent="secondary">Previous</Button>
                        </Link>
                        <Button onClick={handleFinishSetup}>
                            Finish Setup
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConvertOnboardingRecommendationsView
