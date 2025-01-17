import {Tooltip} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import {fromJS, Map} from 'immutable'
import React, {MouseEvent, useCallback, useMemo} from 'react'
import {Link, useParams} from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'

import useAppSelector from 'hooks/useAppSelector'

import {useListCampaigns} from 'models/convert/campaign/queries'
import {
    CampaignCreatePayload,
    CampaignListOptions as CampaignListOptionsParams,
} from 'models/convert/campaign/types'
import {IntegrationType} from 'models/integration/constants'

import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import NavigatedSuccessModal, {
    NavigatedSuccessModalName,
} from 'pages/common/components/SuccessModal/NavigatedSuccessModal'
import {SuccessModalIcon} from 'pages/common/components/SuccessModal/SuccessModal'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import ConvertUpsellBanner from 'pages/convert/campaigns/components/ConvertUpsellBanner/ConvertUpsellBanner'
import {useIsCampaignCreationAllowed} from 'pages/convert/campaigns/hooks/useIsCampaignCreationAllowed'
import {CampaignListOptions} from 'pages/convert/campaigns/providers/CampaignListOptions'

import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {ConvertRouteParams} from 'pages/convert/common/types'
import history from 'pages/history'
import {getIntegrationById} from 'state/integrations/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {toJS} from 'utils'

import css from './CampaignsView.less'
import ConvertLibraryBanner from './components/ConvertLibraryBanner'
import CampaignsList from './containers/CampaignsList/CampaignsList'
import {useCreateCampaign} from './hooks/useCreateCampaign'
import {useDeleteCampaign} from './hooks/useDeleteCampaign'
import {useUpdateCampaign} from './hooks/useUpdateCampaign'
import {Campaign} from './types/Campaign'
import {CampaignStatus, isActiveStatus} from './types/enums/CampaignStatus.enum'
import {duplicateCampaign} from './utils/duplicateCampaign'

export const CampaignsView = () => {
    const {[CONVERT_ROUTE_PARAM_NAME]: integrationId} =
        useParams<ConvertRouteParams>()

    const dispatch = useAppDispatch()

    const chatIntegrationId = parseInt(integrationId)
    const integration = useAppSelector(getIntegrationById(chatIntegrationId))
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

    const {mutate: updateCampaign, isLoading: isUpdatingCampaign} =
        useUpdateCampaign()
    const {mutateAsync: createCampaign} = useCreateCampaign()
    const {mutate: deleteCampaign, isLoading: isDeletingCampaign} =
        useDeleteCampaign()

    const toggleCampaign = useCallback(
        (campaign: Campaign) => {
            const status = isActiveStatus(campaign.status)
                ? CampaignStatus.Inactive
                : CampaignStatus.Active
            if (!!channelConnection) {
                void updateCampaign(
                    [
                        undefined,
                        {
                            campaign_id: campaign.id,
                            channelConnectionId: channelConnection.id,
                        },
                        {
                            status: status,
                        },
                    ],
                    {
                        onSuccess: () => {
                            if (
                                campaign.schedule &&
                                status === CampaignStatus.Inactive
                            ) {
                                void dispatch(
                                    notify({
                                        status: NotificationStatus.Warning,
                                        message:
                                            'Your campaign won’t be displayed on your <br> store anymore, regardless of the set schedule.',
                                        allowHTML: true,
                                        dismissAfter: 30000,
                                        dismissible: true,
                                        showDismissButton: true,
                                    })
                                )
                            }
                        },
                    }
                )
            }
        },
        [updateCampaign, channelConnection, dispatch]
    )

    const handleDuplicateCampaign = useCallback(
        async (event: MouseEvent, campaign: Campaign) => {
            event.stopPropagation()

            if (!!channelConnection) {
                const duplicate = duplicateCampaign(
                    campaign,
                    channelConnection.id
                ) as CampaignCreatePayload
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
            allCampaigns.length < 8
        )
    }, [isLoading, hasStoreConnected, isConvertSubscriber, allCampaigns])

    const shouldDisplayUpsellBanner = useMemo(() => {
        return !isConvertSubscriber && hasStoreConnected
    }, [isConvertSubscriber, hasStoreConnected])

    const isCreateCampaignButtonDisabled =
        !useIsCampaignCreationAllowed(integration)

    return (
        <CampaignListOptions>
            <NavigatedSuccessModal
                name={NavigatedSuccessModalName.ConvertOnboarding}
                icon={SuccessModalIcon.PartyPopper}
                buttonLabel="Go To Campaigns"
            >
                <div className="heading-page-semibold mb-2">All set!</div>
                <div className="heading-subsection-regular">
                    You can now display campaigns on your website.
                </div>
            </NavigatedSuccessModal>
            <div className={classnames('full-width', css.pageWrapper)}>
                <PageHeader title={'Campaigns'}>
                    {isConvertSubscriber && hasStoreConnected ? (
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
                        <>
                            <Link
                                to={`/app/convert/${integrationId}/campaigns/new`}
                                className={css.createCampaignFromLibraryLink}
                            >
                                <Button
                                    id="create-campaign-button"
                                    isDisabled={isCreateCampaignButtonDisabled}
                                >
                                    Create Campaign
                                </Button>
                            </Link>
                            {isCreateCampaignButtonDisabled && (
                                <Tooltip
                                    placement="bottom-start"
                                    target="create-campaign-button"
                                    autohide={false}
                                >
                                    To create more campaigns,{' '}
                                    <a
                                        href={
                                            'https://www.gorgias.com/products/convert#section-conversion'
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        discover Convert
                                    </a>
                                    .
                                </Tooltip>
                            )}
                        </>
                    )}
                </PageHeader>

                <CampaignsList
                    campaigns={allCampaigns}
                    integration={immutableIntegration}
                    isLoading={isLoading}
                    isUpdatingCampaign={isUpdatingCampaign}
                    isDeletingCampaign={isDeletingCampaign}
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
                {shouldDisplayUpsellBanner && (
                    <div className={css.bannerWrapper}>
                        <ConvertUpsellBanner />
                    </div>
                )}
            </div>
        </CampaignListOptions>
    )
}

export default CampaignsView
