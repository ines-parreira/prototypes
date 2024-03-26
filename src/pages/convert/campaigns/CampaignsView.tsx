import React, {MouseEvent, useCallback, useMemo} from 'react'
import {Link, useParams} from 'react-router-dom'

import {fromJS, Map} from 'immutable'
import classnames from 'classnames'

import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'

import useAppSelector from 'hooks/useAppSelector'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {useIsConvertCampaignLibraryEnabled} from 'pages/convert/common/hooks/useIsConvertCampaignLibraryEnabled'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

import {useListCampaigns} from 'models/convert/campaign/queries'
import {CampaignListOptions as CampaignListOptionsParams} from 'models/convert/campaign/types'
import {CampaignListOptions} from 'pages/convert/campaigns/providers/CampaignListOptions'
import {getIntegrationById} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/constants'

import {toJS} from 'utils'
import history from 'pages/history'
import {CONVERT_ROUTE_PARAM_NAME} from '../common/constants'
import {ConvertRouteParams} from '../common/types'
import {CampaignStatus, isActiveStatus} from './types/enums/CampaignStatus.enum'
import {Campaign} from './types/Campaign'
import css from './CampaignsView.less'
import ConvertLibraryBanner from './components/ConvertLibraryBanner'
import {useUpdateCampaign} from './hooks/useUpdateCampaign'
import {useCreateCampaign} from './hooks/useCreateCampaign'
import {useDeleteCampaign} from './hooks/useDeleteCampaign'
import {duplicateCampaign} from './utils/duplicateCampaign'
import CampaignsList from './containers/CampaignsList/CampaignsList'

export const CampaignsView = () => {
    const {[CONVERT_ROUTE_PARAM_NAME]: integrationId} =
        useParams<ConvertRouteParams>()

    const chatIntegrationId = parseInt(integrationId)
    const integration = useAppSelector(getIntegrationById(chatIntegrationId))
    const isCampaignLibraryEnabled = useIsConvertCampaignLibraryEnabled()
    const isConvertSubscriber: boolean = useIsConvertSubscriber()

    const immutableIntegration = useMemo(
        () => fromJS(integration) as Map<any, any>,
        [integration]
    )

    const hasStoreConnected = useMemo<boolean>(
        () =>
            Boolean(
                integration.getIn(['meta', 'shop_integration_id']) &&
                    integration.getIn(['meta', 'shop_type']) ===
                        IntegrationType.Shopify
            ),
        [integration]
    )

    const {channelConnection, isLoading: isChannelConnectionLoading} =
        useGetOrCreateChannelConnection(toJS(integration))

    const {mutate: updateCampaign} = useUpdateCampaign()
    const {mutateAsync: createCampaign} = useCreateCampaign()
    const {mutate: deleteCampaign} = useDeleteCampaign()

    const toggleCampaign = useCallback(
        (campaign: Campaign) => {
            const status = isActiveStatus(campaign.status)
                ? CampaignStatus.Inactive
                : CampaignStatus.Active

            if (!!channelConnection) {
                void updateCampaign([
                    undefined,
                    {
                        campaign_id: campaign.id,
                        channelConnectionId: channelConnection.id,
                    },
                    {
                        status: status,
                    },
                ])
            }
        },
        [updateCampaign, channelConnection]
    )

    const handleDuplicateCampaign = useCallback(
        async (event: MouseEvent, campaign: Campaign) => {
            event.stopPropagation()

            if (!!channelConnection) {
                const duplicate = duplicateCampaign(
                    campaign,
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

    const handleDeleteCampaign = useCallback(
        (campaign: Campaign) => {
            if (!!channelConnection) {
                deleteCampaign([
                    undefined,
                    {
                        campaign_id: campaign.id,
                        channelConnectionId: channelConnection.id,
                    },
                ])
            }
        },
        [deleteCampaign, channelConnection]
    )

    const campaignListOptions = useMemo(() => {
        const channelConnectionId = channelConnection?.id
        return (
            channelConnectionId
                ? {
                      channelConnectionId: channelConnectionId,
                  }
                : {}
        ) as CampaignListOptionsParams
    }, [channelConnection])

    const {data: campaigns, isLoading: areCampaignsLoading} = useListCampaigns(
        campaignListOptions,
        {
            enabled: !!channelConnection && !!campaignListOptions,
        }
    )

    const allCampaigns = useMemo(() => {
        return (campaigns || []) as Campaign[]
    }, [campaigns])

    const isLoading = useMemo(
        () => isChannelConnectionLoading || areCampaignsLoading,
        [isChannelConnectionLoading, areCampaignsLoading]
    )

    const shouldDisplayBanner = useMemo(() => {
        return (
            !isLoading &&
            hasStoreConnected &&
            isConvertSubscriber &&
            isCampaignLibraryEnabled &&
            allCampaigns.length < 8
        )
    }, [
        isLoading,
        hasStoreConnected,
        isCampaignLibraryEnabled,
        isConvertSubscriber,
        allCampaigns,
    ])

    return (
        <CampaignListOptions>
            <div className={classnames('full-width', css.pageWrapper)}>
                <PageHeader title={'Campaigns'}>
                    {isConvertSubscriber &&
                    isCampaignLibraryEnabled &&
                    hasStoreConnected ? (
                        <>
                            <Link
                                to={`/app/convert/${integrationId}/campaigns/new`}
                            >
                                <Button intent="secondary">
                                    Create Custom Campaign
                                </Button>
                            </Link>

                            <Link
                                to={`/app/convert/${integrationId}/campaigns/library`}
                                className={css.createCampaignFromLibraryLink}
                            >
                                <Button>Create Campaign From Library</Button>
                            </Link>
                        </>
                    ) : (
                        <Link
                            to={`/app/convert/${integrationId}/campaigns/new`}
                            className={css.createCampaignFromLibraryLink}
                        >
                            <Button>Create Campaign</Button>
                        </Link>
                    )}
                </PageHeader>

                <CampaignsList
                    campaigns={allCampaigns}
                    integration={immutableIntegration}
                    isLoading={isLoading}
                    onDeleteCampaign={handleDeleteCampaign}
                    onDuplicateCampaign={handleDuplicateCampaign}
                    onUpdateCampaign={toggleCampaign}
                />
                {shouldDisplayBanner && (
                    <div className={css.bannerWrapper}>
                        <ConvertLibraryBanner
                            integrationId={chatIntegrationId}
                        />
                    </div>
                )}
            </div>
        </CampaignListOptions>
    )
}

export default CampaignsView
