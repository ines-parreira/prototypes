import {Tooltip} from '@gorgias/merchant-ui-kit'
import {isEmpty} from 'lodash'
import React, {useState, useEffect} from 'react'
import {Link, NavLink, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {logEvent, SegmentEvent} from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import useSearch from 'hooks/useSearch'
import useTitle from 'hooks/useTitle'
import {disconnectApp, fetchApp} from 'models/integration/resources'
import {
    AppDetail as AppDetailType,
    TrialPeriod,
} from 'models/integration/types/app'
import {ColorType} from 'pages/common/components/Badge/Badge'
import AlertBanner from 'pages/common/components/BannerNotifications/AlertBanner'
import {AlertBannerTypes} from 'pages/common/components/BannerNotifications/types'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import PageHeader from 'pages/common/components/PageHeader'
import Detail from 'pages/common/components/ProductDetail'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import AppAdvanced from 'pages/integrations/Advanced'
import AlloyConnectButton from 'pages/integrations/components/AlloyConnectButton'
import ConnectLink from 'pages/integrations/components/ConnectLink'
import {mapAppToDetail} from 'pages/integrations/mappers/appToDetail'
import {mapDefaults} from 'pages/integrations/mappers/mapDefaults'
import {getApplicationById} from 'services/applications'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {fetchIntegrations} from 'state/integrations/actions'
import {getIntegrationsByAppId} from 'state/integrations/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import IntegrationsList from './IntegrationsList'

export enum Tab {
    Details = 'details',
    Advanced = 'advanced',
    Connections = 'connections',
}

function queryStringToBool(flag?: string): boolean {
    return flag === '' || flag === '1' || flag?.toLowerCase() === 'true'
}

export default function AppDetail() {
    const dispatch = useAppDispatch()
    const {appId, extra = Tab.Details} = useParams<{
        appId: string
        extra?: string
    }>()

    const search = useSearch<{preview?: string}>()
    const preview = queryStringToBool(search.preview)

    const [appItem, setAppDetail] = useState<AppDetailType | null>(null)
    const [isLoading, setLoading] = useState(false)

    const baseURL = `/app/settings/integrations/app/${appId}`

    const hasConnections = !isEmpty(
        useAppSelector(getIntegrationsByAppId(appId))
    )

    useEffectOnce(() => {
        void dispatch(fetchIntegrations())
    })

    const supportsMultipleConnections = () =>
        getApplicationById(appId)?.supports_multiple_connections || false

    useEffect(() => {
        async function loadAppDetails(appId: string) {
            try {
                const res = await fetchApp(appId, preview)
                setAppDetail(res)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        setLoading(true)
        void loadAppDetails(appId)
    }, [appId, preview])

    useTitle(appItem?.title)

    if (!appItem || isLoading) {
        return <Loader minHeight="300px" />
    }

    const detailProps = mapAppToDetail(mapDefaults(appItem))

    if (appItem.hasFreeTrial) {
        let trialLabel = 'Free trial'
        if (
            appItem.freeTrialPeriod &&
            appItem.freeTrialPeriod !== TrialPeriod.CUSTOM
        ) {
            trialLabel = appItem.freeTrialPeriod + ' free trial'
        }
        detailProps.categories?.push({
            label: trialLabel,
            type: ColorType.Success,
        })
    }

    if (appItem.isUnapproved) {
        detailProps.infocard.banner = (
            <AlertBanner
                type={AlertBannerTypes.Warning}
                message="<strong>This app has not been approved by Gorgias.</strong><br />We approve apps to ensure your security, be sure that you trust this app before granting it access."
            />
        )
    }
    detailProps.infocard.CTA = <AppCTA {...appItem} />

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">
                                All apps
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>{appItem.title}</BreadcrumbItem>
                    </Breadcrumb>
                }
            >
                {extra === Tab.Connections && supportsMultipleConnections() && (
                    <ConnectLink
                        connectUrl={appItem.connectUrl}
                        isApp
                        integrationTitle={appItem.title}
                    >
                        <Button>Add Account</Button>
                    </ConnectLink>
                )}
            </PageHeader>

            {appItem.isConnected && (
                <SecondaryNavbar>
                    <NavLink to={baseURL} exact>
                        App Details
                    </NavLink>
                    <NavLink to={`${baseURL}/advanced`} exact>
                        Advanced
                    </NavLink>
                    {hasConnections && (
                        <NavLink to={`${baseURL}/connections`} exact>
                            Connections
                        </NavLink>
                    )}
                </SecondaryNavbar>
            )}
            {extra === Tab.Advanced && <AppAdvanced {...appItem} />}
            {extra === Tab.Details && <Detail {...detailProps} />}
            {extra === Tab.Connections && (
                <IntegrationsList
                    appId={appItem.appId}
                    connectUrl={appItem.connectUrl}
                />
            )}
        </div>
    )
}

function AppCTA({
    alloyIntegrationId,
    isUnapproved,
    appId,
    connectUrl,
    isConnected,
    title,
}: AppDetailType) {
    const dispatch = useAppDispatch()
    const domain = useAppSelector(getCurrentAccountState).get('domain')

    const [isLoading, setLoading] = useState(false)
    const [isAppInstalled, setAppInstalled] = useState<boolean>(isConnected)
    const [isModalOpen, setModalOpen] = useState(false)

    const hasConnections = !isEmpty(
        useAppSelector(getIntegrationsByAppId(appId))
    )

    const supportsMultipleConnections =
        getApplicationById(appId)?.supports_multiple_connections || false

    const isAppDisconnectionDisabled =
        supportsMultipleConnections && hasConnections

    const handleAppDisconnection = async () => {
        logEvent(SegmentEvent.IntegrationDisconnectClicked, {
            integration: title.toLowerCase(),
            is_openchannel_app: true,
            account_domain: domain,
        })
        setLoading(true)
        try {
            const isUninstalled = await disconnectApp(appId)
            if (isUninstalled) {
                setAppInstalled(!isUninstalled)
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: `${title} has been disconnected.`,
                    })
                )
            } else {
                throw new Error(`Not disconnected`)
            }
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: `Sorry, something went wrong. ${title} is still connected.`,
                })
            )
        } finally {
            setModalOpen(false)
            setLoading(false)
        }
    }
    return (
        <>
            {alloyIntegrationId ? (
                <AlloyConnectButton
                    appId={appId}
                    integrationId={alloyIntegrationId}
                    name={title}
                />
            ) : isAppInstalled ? (
                <>
                    <Button
                        intent="destructive"
                        isDisabled={isAppDisconnectionDisabled}
                        id="disconnect-app-button"
                        onClick={() => setModalOpen(true)}
                    >
                        Disconnect App
                    </Button>
                    {isAppDisconnectionDisabled && (
                        <Tooltip placement="top" target="disconnect-app-button">
                            App cannot be disconnected while accounts are still
                            integrated with Gorgias. Please disconnect all
                            integrated accounts before disconnecting the app.
                        </Tooltip>
                    )}
                </>
            ) : (
                <>
                    <ConnectLink
                        connectUrl={connectUrl}
                        isApp
                        integrationTitle={title}
                    >
                        <Button>
                            {isUnapproved
                                ? 'Connect Unapproved App'
                                : 'Connect App'}
                        </Button>
                    </ConnectLink>
                </>
            )}
            <Modal
                onClose={() => setModalOpen(false)}
                isOpen={isModalOpen}
                size="small"
            >
                <ModalHeader title={`Disconnect ${title}?`} />
                <ModalBody>
                    <p>
                        Disconnecting the app revokes its permission to send or
                        receive your Gorgias data.
                    </p>
                </ModalBody>
                <ModalActionsFooter>
                    <Button
                        intent="secondary"
                        isDisabled={isLoading}
                        onClick={() => setModalOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        intent="destructive"
                        isLoading={isLoading}
                        onClick={handleAppDisconnection}
                    >
                        {isLoading ? 'Disconnecting' : 'Disconnect'}
                    </Button>
                </ModalActionsFooter>
            </Modal>
        </>
    )
}
