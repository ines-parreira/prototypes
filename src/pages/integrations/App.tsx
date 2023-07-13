import React, {useState, useEffect} from 'react'
import {Link, NavLink, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import useTitle from 'hooks/useTitle'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import useSearch from 'hooks/useSearch'
import {
    AppDetail as AppDetailType,
    TrialPeriod,
} from 'models/integration/types/app'
import {disconnectApp, fetchApp} from 'models/integration/resources'
import PageHeader from 'pages/common/components/PageHeader'
import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import Loader from 'pages/common/components/Loader/Loader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import Detail from 'pages/common/components/ProductDetail'
import {ColorType} from 'pages/common/components/Badge/Badge'
import AppAdvanced from 'pages/integrations/Advanced'
import AlloyConnectButton from 'pages/integrations/components/AlloyConnectButton'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ConnectLink from './components/ConnectLink'
import {mapAppToDetail} from './mappers/appToDetail'

export enum Tab {
    Details = 'details',
    Advanced = 'advanced',
}

function queryStringToBool(flag?: string): boolean {
    return flag === '' || flag === '1' || flag?.toLowerCase() === 'true'
}

export default function AppDetail() {
    const {appId, extra = Tab.Details} = useParams<{
        appId: string
        extra?: string
    }>()

    const search = useSearch<{preview?: string}>()
    const preview = queryStringToBool(search.preview)

    const [appItem, setAppDetail] = useState<AppDetailType | null>(null)
    const [isLoading, setLoading] = useState(false)

    const baseURL = `/app/settings/integrations/app/${appId}`

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

    const detailProps = mapAppToDetail(appItem)

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
            <BannerNotification
                status={NotificationStatus.Warning}
                allowHTML
                message="<strong>This app has not been approved by Gorgias.</strong><br />We approve apps to ensure your security, be sure that you trust this app before granting it access."
                showIcon
                dismissible={false}
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
            />
            {appItem.isConnected && (
                <SecondaryNavbar>
                    <NavLink to={baseURL} exact>
                        App Details
                    </NavLink>
                    <NavLink to={`${baseURL}/advanced`} exact>
                        Advanced
                    </NavLink>
                </SecondaryNavbar>
            )}
            {extra === Tab.Advanced && <AppAdvanced {...appItem} />}
            {extra === Tab.Details && <Detail {...detailProps} />}
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
                <Button intent="destructive" onClick={() => setModalOpen(true)}>
                    Disconnect App
                </Button>
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
