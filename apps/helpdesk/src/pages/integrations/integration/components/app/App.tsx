import { useCallback, useEffect, useRef, useState } from 'react'

import { useEffectOnce, useTitle } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { isEmpty, kebabCase } from 'lodash'
import { Link, NavLink, useHistory, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import {
    LegacyButton as Button,
    toast,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { AlertBannerTypes } from 'AlertBanners'
import { AlertBanner } from 'AlertBanners/components/AlertBanner'
import { useActionCentralizedLibraryEnabled } from 'hooks/integrations/useActionCentralizedLibraryEnabled'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useSearch } from 'hooks/useSearch'
import { IntegrationType } from 'models/integration/constants'
import {
    useAssignServiceConnectionStore,
    useCreateServiceConnection,
    useListServiceConnectionsByAppId,
} from 'models/integration/queries'
import { disconnectApp, fetchApp } from 'models/integration/resources'
import type { StoreIntegration } from 'models/integration/types'
import type {
    AppDetail as AppDetailType,
    OutboundAuth,
} from 'models/integration/types/app'
import { TrialPeriod } from 'models/integration/types/app'
import type {
    CreateServiceConnectionRequest,
    ServiceConnectionAuthType,
} from 'models/integration/types/serviceConnection'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import type { ConnectAppAuthCredentials } from 'pages/aiAgent/actionsV2/apps/components'
import {
    ConnectAppAuthModal,
    ConnectAppModal,
    InstallSuccessModal,
} from 'pages/aiAgent/actionsV2/apps/components'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
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
import { mapAppToDetail } from 'pages/integrations/mappers/appToDetail'
import { mapDefaults } from 'pages/integrations/mappers/mapDefaults'
import { getApplicationById } from 'services/applications'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { fetchIntegrations } from 'state/integrations/actions'
import { getIntegrationsByAppId } from 'state/integrations/selectors'

import AppActionsConnections from './AppActionsConnections'
import AppActionsTab from './AppActionsTab'
import IntegrationsList from './IntegrationsList'

export enum Tab {
    Details = 'details',
    Advanced = 'advanced',
    Connections = 'connections',
    Actions = 'actions',
}

function queryStringToBool(flag?: string): boolean {
    return flag === '' || flag === '1' || flag?.toLowerCase() === 'true'
}

function authValueFromCredentials(
    outboundAuth: OutboundAuth,
    credentials: ConnectAppAuthCredentials,
): string {
    if (outboundAuth.type === 'basic' && 'username' in credentials) {
        return `${credentials.username}:${credentials.password}`
    }
    if ('value' in credentials) {
        return credentials.value
    }
    return ''
}

export default function AppDetail() {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const { appId, extra: extraParam } = useParams<{
        appId: string
        extra?: string
    }>()
    const extra = extraParam ?? Tab.Details

    const search = useSearch<{ preview?: string }>()
    const preview = queryStringToBool(search.preview)

    const [appItem, setAppDetail] = useState<AppDetailType | null>(null)
    const [isLoading, setLoading] = useState(false)
    const [isAuthModalOpen, setAuthModalOpen] = useState(false)
    const [isConnectModalOpen, setConnectModalOpen] = useState(false)
    const [isInstallSuccessOpen, setInstallSuccessOpen] = useState(false)
    const [createdConnectionId, setCreatedConnectionId] = useState<
        string | null
    >(null)
    const [primaryStore, setPrimaryStore] = useState<StoreIntegration | null>(
        null,
    )
    // Keep in sync with `SUPPORTED_STORE_TYPES` in `ConnectAppModal`.
    const storeIntegrations = useStoreIntegrations([IntegrationType.Shopify])

    const baseURL = `/app/settings/integrations/app/${appId}`

    const { isEnabled: isActionLibraryEnabled } =
        useActionCentralizedLibraryEnabled()

    const hasConnections = !isEmpty(
        useAppSelector(getIntegrationsByAppId(appId)),
    )

    useEffectOnce(() => {
        void dispatch(fetchIntegrations())
    })

    const supportsMultipleConnections = () =>
        getApplicationById(appId)?.supports_multiple_connections || false

    const { data: existingConnections } = useListServiceConnectionsByAppId(
        appId,
        { enabled: isActionLibraryEnabled },
    )

    const hasServiceConnections = !isEmpty(existingConnections)

    const {
        mutateAsync: createServiceConnection,
        isLoading: isCreatingConnection,
    } = useCreateServiceConnection(appId)
    const { mutateAsync: assignStore, isLoading: isAssigningStore } =
        useAssignServiceConnectionStore()

    const refetchAppItem = useCallback(async () => {
        try {
            const res = await fetchApp(appId, preview)
            setAppDetail(res)
        } catch (error) {
            console.error(error)
        }
    }, [appId, preview])

    const hasAutoRedirectedRef = useRef(false)
    useEffect(() => {
        if (hasAutoRedirectedRef.current) return
        if (
            !extraParam &&
            isActionLibraryEnabled &&
            existingConnections &&
            existingConnections.length > 0
        ) {
            hasAutoRedirectedRef.current = true
            history.replace(`${baseURL}/connections`)
        }
    }, [
        extraParam,
        isActionLibraryEnabled,
        existingConnections,
        history,
        baseURL,
    ])

    useEffect(() => {
        let cancelled = false
        async function loadAppDetails(showLoader: boolean) {
            if (showLoader) setLoading(true)
            try {
                const res = await fetchApp(appId, preview)
                if (!cancelled) setAppDetail(res)
            } catch (error) {
                console.error(error)
            } finally {
                if (!cancelled && showLoader) setLoading(false)
            }
        }

        void loadAppDetails(true)

        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                void loadAppDetails(false)
            }
        }
        document.addEventListener('visibilitychange', onVisibilityChange)
        return () => {
            cancelled = true
            document.removeEventListener('visibilitychange', onVisibilityChange)
        }
    }, [appId, preview])

    useTitle(appItem?.title)

    if (!appItem || isLoading) {
        return <Loader minHeight="300px" />
    }

    const isAppConnected =
        appItem.isConnected || (isActionLibraryEnabled && hasServiceConnections)

    const detailProps = mapAppToDetail(mapDefaults(appItem))

    if (
        isAppConnected &&
        supportsMultipleConnections() &&
        !(isActionLibraryEnabled ? hasServiceConnections : hasConnections)
    ) {
        detailProps.alertBanner = {
            type: AlertBannerTypes.Critical,
            message:
                'This app doesn’t have any connected accounts yet, reconnect the app to start using it. If you still see this message contact our support to help you.',
        }
    }
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
            type: 'success',
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
    const hasOutboundAuth = !!appItem.outboundAuth
    const useModalConnect = isActionLibraryEnabled && hasOutboundAuth

    detailProps.infocard.CTA = (
        <AppCTA
            {...appItem}
            isConnected={isAppConnected}
            hasConnections={
                isActionLibraryEnabled ? hasServiceConnections : undefined
            }
            hideDisconnect={isActionLibraryEnabled}
            onConnectClick={() => setAuthModalOpen(true)}
            useLegacyConnect={!useModalConnect}
        />
    )

    const handleAuthSubmit = async (credentials: ConnectAppAuthCredentials) => {
        if (!appItem.outboundAuth) return
        const outboundAuth = appItem.outboundAuth
        const connectionsCount = existingConnections?.length ?? 0
        const name =
            supportsMultipleConnections() && connectionsCount > 0
                ? `${appItem.title} (${connectionsCount + 1})`
                : appItem.title
        const payload: CreateServiceConnectionRequest = {
            name,
            service: kebabCase(appItem.title) || appId,
            url: outboundAuth.url,
            auth: {
                type: outboundAuth.type as ServiceConnectionAuthType,
                location: outboundAuth.location,
                key: outboundAuth.key,
                value: authValueFromCredentials(outboundAuth, credentials),
            },
            application_id: appId,
            vendor: outboundAuth.vendor ?? null,
        }

        try {
            const connection = await createServiceConnection(payload)
            setCreatedConnectionId(connection.id)
            await refetchAppItem()
            setAuthModalOpen(false)

            if (storeIntegrations.length === 1) {
                const onlyStore = storeIntegrations[0]
                try {
                    await assignStore({
                        connectionId: connection.id,
                        storeId: onlyStore.id,
                    })
                    setPrimaryStore(onlyStore)
                    setInstallSuccessOpen(true)
                } catch {
                    toast.error(
                        `Connected ${appItem.title}, but failed to link your store. You can link it from the Connections tab.`,
                    )
                }
            } else if (storeIntegrations.length > 1) {
                setConnectModalOpen(true)
            } else {
                setInstallSuccessOpen(true)
            }
        } catch {
            toast.error(
                `Sorry, we couldn't connect ${appItem.title}. Please check your credentials and try again.`,
            )
        }
    }

    const handleStorePickerSubmit = async (stores: StoreIntegration[]) => {
        if (!createdConnectionId || stores.length === 0) {
            setConnectModalOpen(false)
            return
        }
        try {
            await Promise.all(
                stores.map((store) =>
                    assignStore({
                        connectionId: createdConnectionId,
                        storeId: store.id,
                    }),
                ),
            )
            setPrimaryStore(stores[0])
            setConnectModalOpen(false)
            setInstallSuccessOpen(true)
        } catch {
            toast.error(
                `Failed to link the selected store${stores.length > 1 ? 's' : ''} to ${appItem.title}.`,
            )
        }
    }

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
                {extra === Tab.Connections && useModalConnect ? (
                    <Button onClick={() => setAuthModalOpen(true)}>
                        Add connection
                    </Button>
                ) : extra === Tab.Connections &&
                  (isActionLibraryEnabled || supportsMultipleConnections()) ? (
                    <ConnectLink
                        connectUrl={appItem.connectUrl}
                        isApp
                        integrationTitle={appItem.title}
                    >
                        <Button>
                            {isActionLibraryEnabled
                                ? 'Add connection'
                                : 'Add Account'}
                        </Button>
                    </ConnectLink>
                ) : extra === Tab.Actions && isActionLibraryEnabled ? (
                    <ConnectLink
                        connectUrl={appItem.connectUrl}
                        isApp
                        integrationTitle={appItem.title}
                    >
                        <Button>Add connection</Button>
                    </ConnectLink>
                ) : null}
            </PageHeader>

            {isAppConnected && (
                <SecondaryNavbar>
                    <NavLink to={baseURL} exact>
                        App Details
                    </NavLink>
                    <NavLink to={`${baseURL}/advanced`} exact>
                        Advanced
                    </NavLink>
                    {(isActionLibraryEnabled
                        ? hasServiceConnections
                        : hasConnections) && (
                        <NavLink to={`${baseURL}/connections`} exact>
                            Connections
                        </NavLink>
                    )}
                    {isActionLibraryEnabled && (
                        <NavLink to={`${baseURL}/actions`} exact>
                            Actions
                        </NavLink>
                    )}
                </SecondaryNavbar>
            )}
            {extra === Tab.Advanced && <AppAdvanced {...appItem} />}
            {extra === Tab.Details && <Detail {...detailProps} />}
            {extra === Tab.Connections &&
                (isActionLibraryEnabled ? (
                    <AppActionsConnections
                        appId={appItem.appId}
                        connectUrl={appItem.connectUrl}
                    />
                ) : (
                    <IntegrationsList
                        appId={appItem.appId}
                        connectUrl={appItem.connectUrl}
                    />
                ))}
            {extra === Tab.Actions && isActionLibraryEnabled && (
                <AppActionsTab
                    appId={appItem.appId}
                    appName={appItem.title}
                    appIcon={appItem.image}
                />
            )}
            <ConnectAppAuthModal
                isOpen={isAuthModalOpen}
                onOpenChange={setAuthModalOpen}
                app={{ name: appItem.title, iconUrl: appItem.image }}
                outboundAuth={appItem.outboundAuth}
                isSubmitting={isCreatingConnection || isAssigningStore}
                onSubmit={handleAuthSubmit}
            />
            <ConnectAppModal
                isOpen={isConnectModalOpen}
                onOpenChange={setConnectModalOpen}
                app={{ name: appItem.title }}
                isSubmitting={isAssigningStore}
                onSubmit={handleStorePickerSubmit}
            />
            <InstallSuccessModal
                isOpen={isInstallSuccessOpen}
                onOpenChange={setInstallSuccessOpen}
                appName={appItem.title}
                onViewActions={() => {
                    setInstallSuccessOpen(false)
                    if (primaryStore) {
                        const shopName =
                            getShopNameFromStoreIntegration(primaryStore)
                        history.push(
                            `/app/ai-agent/${primaryStore.type}/${shopName}/actions`,
                        )
                    } else {
                        history.push('/app/ai-agent')
                    }
                }}
            />
        </div>
    )
}

type AppCTAProps = AppDetailType & {
    onConnectClick: () => void
    hasConnections?: boolean
    hideDisconnect?: boolean
    useLegacyConnect?: boolean
}

function AppCTA({
    alloyIntegrationId,
    isUnapproved,
    appId,
    isConnected,
    title,
    connectUrl,
    onConnectClick,
    hasConnections: hasConnectionsOverride,
    hideDisconnect = false,
    useLegacyConnect = false,
}: AppCTAProps) {
    const domain = useAppSelector(getCurrentAccountState).get('domain')

    const [isLoading, setLoading] = useState(false)
    const [isAppInstalled, setAppInstalled] = useState<boolean>(isConnected)
    const [isModalOpen, setModalOpen] = useState(false)

    const legacyHasConnections = !isEmpty(
        useAppSelector(getIntegrationsByAppId(appId)),
    )
    const hasConnections = hasConnectionsOverride ?? legacyHasConnections

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
                toast.success(`${title} has been disconnected.`)
            } else {
                throw new Error(`Not disconnected`)
            }
        } catch {
            toast.error(
                `Sorry, something went wrong. ${title} is still connected.`,
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
            ) : isAppInstalled && !hideDisconnect ? (
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
            ) : useLegacyConnect ? (
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
            ) : (
                <Button onClick={onConnectClick}>
                    {isUnapproved ? 'Connect Unapproved App' : 'Connect App'}
                </Button>
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
