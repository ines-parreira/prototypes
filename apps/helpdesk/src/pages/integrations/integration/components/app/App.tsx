import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useEffectOnce, useTitle } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useQueryClient } from '@tanstack/react-query'
import { useTrackstarLink } from '@trackstar/react-trackstar-link'
import { isEmpty, kebabCase } from 'lodash'
import { Link, NavLink, useHistory, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import {
    LegacyButton as Button,
    toast,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'
import {
    useLinkTrackstar,
    useServiceConnectionTrackstar,
} from '@gorgias/workflows-queries'

import { AlertBannerTypes } from 'AlertBanners'
import { AlertBanner } from 'AlertBanners/components/AlertBanner'
import { useActionCentralizedLibraryEnabled } from 'hooks/integrations/useActionCentralizedLibraryEnabled'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useSearch } from 'hooks/useSearch'
import { IntegrationType } from 'models/integration/constants'
import {
    serviceConnectionsQueryKey,
    useAssignServiceConnectionStore,
    useCreateServiceConnection,
    useListServiceConnectionsByAppId,
    useListServiceConnectionStoresByConnectionIds,
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
import { useAppActionSteps } from './hooks/useAppActionSteps'
import IntegrationsList from './IntegrationsList'
import InboundConnectionCard from './SetupCards/InboundConnectionCard'
import OutboundConnectionCard from './SetupCards/OutboundConnectionCard'
import SetupCards from './SetupCards/SetupCards'

export enum Tab {
    Details = 'details',
    Advanced = 'advanced',
    Credentials = 'credentials',
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
    const queryClient = useQueryClient()
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
    const [createdConnectionId, setCreatedConnectionId] = useState<
        string | null
    >(null)
    const [installSuccessStore, setInstallSuccessStore] = useState<{
        type: string
        shopName: string | undefined
    } | null>(null)
    const installSuccessTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null)
    const scheduleInstallSuccess = useCallback(
        (target: { type: string; shopName: string | undefined }) => {
            if (installSuccessTimeoutRef.current) {
                clearTimeout(installSuccessTimeoutRef.current)
            }
            installSuccessTimeoutRef.current = setTimeout(() => {
                setInstallSuccessStore(target)
                installSuccessTimeoutRef.current = null
            }, Duration.seconds(3))
        },
        [],
    )
    useEffect(() => {
        return () => {
            if (installSuccessTimeoutRef.current) {
                clearTimeout(installSuccessTimeoutRef.current)
            }
        }
    }, [])
    // Keep in sync with `SUPPORTED_STORE_TYPES` in `ConnectAppModal`.
    const storeIntegrations = useStoreIntegrations([IntegrationType.Shopify])

    const baseURL = `/app/settings/integrations/app/${appId}`

    const { isEnabled: isActionLibraryEnabled } =
        useActionCentralizedLibraryEnabled()

    const hasConnections = !isEmpty(
        useAppSelector(getIntegrationsByAppId(appId)),
    )

    const { appActionSteps } = useAppActionSteps(appId)
    const hasAppActions = appActionSteps.length > 0

    useEffectOnce(() => {
        void dispatch(fetchIntegrations())
    })

    const supportsMultipleConnections = () =>
        getApplicationById(appId)?.supports_multiple_connections || false

    const { data: existingConnections } = useListServiceConnectionsByAppId(
        appId,
        {
            enabled: isActionLibraryEnabled,
        },
    )

    const hasServiceConnections = !isEmpty(existingConnections)

    const connectionStoreQueries =
        useListServiceConnectionStoresByConnectionIds(
            (existingConnections ?? []).map((connection) => connection.id),
        )

    const disabledStoreIdsForConnectModal = useMemo<ReadonlySet<number>>(() => {
        const disabled = new Set<number>()
        ;(existingConnections ?? []).forEach((connection, index) => {
            if (connection.id === createdConnectionId) return
            const stores = connectionStoreQueries[index]?.data ?? []
            for (const store of stores) {
                disabled.add(store.store_id)
            }
        })
        return disabled
    }, [existingConnections, connectionStoreQueries, createdConnectionId])

    const {
        mutateAsync: createServiceConnection,
        isLoading: isCreatingConnection,
    } = useCreateServiceConnection(appId)
    const { mutateAsync: assignStore, isLoading: isAssigningStore } =
        useAssignServiceConnectionStore()
    const {
        mutateAsync: createTrackstarServiceConnection,
        isLoading: isCreatingTrackstarConnection,
    } = useServiceConnectionTrackstar()

    const refetchAppItem = useCallback(async () => {
        try {
            const res = await fetchApp(appId, preview)
            setAppDetail(res)
        } catch (error) {
            console.error(error)
        }
    }, [appId, preview])

    useEffect(() => {
        if (extra !== Tab.Credentials) return
        if (!isActionLibraryEnabled) return
        if (!existingConnections) return
        if (existingConnections.length === 0) {
            history.replace(baseURL)
        }
    }, [extra, isActionLibraryEnabled, existingConnections, history, baseURL])

    useEffect(() => {
        let cancelled = false
        async function loadAppDetails() {
            setLoading(true)
            try {
                const res = await fetchApp(appId, preview)
                if (!cancelled) setAppDetail(res)
            } catch (error) {
                console.error(error)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        void loadAppDetails()

        return () => {
            cancelled = true
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
    const isTrackstarConnect =
        appItem.outboundAuth?.vendor === 'trackstar' &&
        !!appItem.outboundAuth.trackstar_integration_name
    const useModalConnect =
        isActionLibraryEnabled && hasOutboundAuth && !isTrackstarConnect

    const openPostConnectFlow = async (connectionId: string) => {
        if (storeIntegrations.length === 1) {
            const onlyStore = storeIntegrations[0]
            try {
                await assignStore({
                    connectionId,
                    storeId: onlyStore.id,
                })
                scheduleInstallSuccess({
                    type: onlyStore.type,
                    shopName: getShopNameFromStoreIntegration(onlyStore),
                })
            } catch {
                toast.error(
                    `Connected ${appItem.title}, but failed to link your store. You can link it from the Credentials tab.`,
                )
            }
        } else if (storeIntegrations.length > 1) {
            setConnectModalOpen(true)
        }
    }

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
                ...(outboundAuth.type === 'custom-scheme'
                    ? { scheme: outboundAuth.custom_scheme ?? null }
                    : {}),
            },
            application_id: appId,
            vendor: outboundAuth.vendor ?? null,
        }

        try {
            const connection = await createServiceConnection(payload)
            setCreatedConnectionId(connection.id)
            await refetchAppItem()
            setAuthModalOpen(false)
            await openPostConnectFlow(connection.id)
        } catch {
            toast.error(
                `Sorry, we couldn't connect ${appItem.title}. Please check your credentials and try again.`,
            )
        }
    }

    const handleTrackstarAuthCode = async (authCode: string) => {
        try {
            const { data } = await createTrackstarServiceConnection({
                data: { auth_code: authCode },
            })
            setCreatedConnectionId(data.id)
            await queryClient.invalidateQueries({
                queryKey: serviceConnectionsQueryKey(appId),
            })
            await refetchAppItem()
            await openPostConnectFlow(data.id)
        } catch {
            toast.error(
                `Sorry, we couldn't connect ${appItem.title}. Please try again.`,
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
            setConnectModalOpen(false)
            const firstStore = stores[0]
            scheduleInstallSuccess({
                type: firstStore.type,
                shopName: getShopNameFromStoreIntegration(firstStore),
            })
        } catch {
            toast.error(
                `Failed to link the selected store${stores.length > 1 ? 's' : ''} to ${appItem.title}.`,
            )
        }
    }

    const handleViewActions = () => {
        const target = installSuccessStore
        setInstallSuccessStore(null)
        if (target && target.type && target.shopName) {
            history.push(
                `/app/ai-agent/${target.type}/${target.shopName}/actions`,
            )
        } else {
            history.push('/app/ai-agent')
        }
    }

    if (isActionLibraryEnabled) {
        detailProps.setupCards = (
            <SetupCards
                outbound={
                    appItem.outboundAuth ? (
                        <OutboundConnectionCard
                            appTitle={appItem.title}
                            outboundAuth={appItem.outboundAuth}
                            isSubmitting={
                                isCreatingTrackstarConnection ||
                                isAssigningStore
                            }
                            onOpenAuthModal={() => setAuthModalOpen(true)}
                            onTrackstarAuthCode={handleTrackstarAuthCode}
                        />
                    ) : null
                }
                inbound={
                    (appItem.connectUrl || appItem.alloyIntegrationId) &&
                    !isTrackstarConnect ? (
                        <InboundConnectionCard
                            appId={appItem.appId}
                            appTitle={appItem.title}
                            connectUrl={appItem.connectUrl}
                            isConnected={appItem.isConnected}
                            isDisconnectDisabled={
                                supportsMultipleConnections() && hasConnections
                            }
                            alloyIntegrationId={appItem.alloyIntegrationId}
                            onDisconnected={refetchAppItem}
                            onAuthorizeReturn={refetchAppItem}
                        />
                    ) : null
                }
            />
        )
    } else {
        detailProps.infocard.CTA = (
            <AppCTA {...appItem} onDisconnected={refetchAppItem} />
        )
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
                {(extra === Tab.Credentials &&
                    (isActionLibraryEnabled ||
                        supportsMultipleConnections())) ||
                (extra === Tab.Actions && isActionLibraryEnabled) ? (
                    isTrackstarConnect && appItem.outboundAuth ? (
                        <TrackstarConnectButton
                            integrationName={
                                appItem.outboundAuth.trackstar_integration_name!
                            }
                            isSubmitting={
                                isCreatingTrackstarConnection ||
                                isAssigningStore
                            }
                            onAuthCode={handleTrackstarAuthCode}
                        />
                    ) : useModalConnect ? (
                        <Button onClick={() => setAuthModalOpen(true)}>
                            Add credentials
                        </Button>
                    ) : (
                        <ConnectLink
                            connectUrl={appItem.connectUrl}
                            isApp
                            integrationTitle={appItem.title}
                        >
                            <Button>Add credentials</Button>
                        </ConnectLink>
                    )
                ) : null}
            </PageHeader>

            {(isAppConnected || (isActionLibraryEnabled && hasAppActions)) && (
                <SecondaryNavbar>
                    <NavLink to={baseURL} exact>
                        App Details
                    </NavLink>
                    {isActionLibraryEnabled && hasAppActions && (
                        <NavLink to={`${baseURL}/actions`} exact>
                            Actions
                        </NavLink>
                    )}
                    {(isActionLibraryEnabled
                        ? hasServiceConnections
                        : hasConnections) && (
                        <NavLink to={`${baseURL}/credentials`} exact>
                            Credentials
                        </NavLink>
                    )}
                    {isAppConnected && (
                        <NavLink to={`${baseURL}/advanced`} exact>
                            Advanced
                        </NavLink>
                    )}
                </SecondaryNavbar>
            )}
            {extra === Tab.Advanced && <AppAdvanced {...appItem} />}
            {extra === Tab.Details && <Detail {...detailProps} />}
            {extra === Tab.Credentials &&
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
            {!isTrackstarConnect && (
                <ConnectAppAuthModal
                    isOpen={isAuthModalOpen}
                    onOpenChange={setAuthModalOpen}
                    app={{ name: appItem.title, iconUrl: appItem.image }}
                    outboundAuth={appItem.outboundAuth}
                    isSubmitting={isCreatingConnection || isAssigningStore}
                    onSubmit={handleAuthSubmit}
                />
            )}
            <ConnectAppModal
                isOpen={isConnectModalOpen}
                onOpenChange={setConnectModalOpen}
                app={{ name: appItem.title }}
                isSubmitting={isAssigningStore}
                onSubmit={handleStorePickerSubmit}
                disabledStoreIds={disabledStoreIdsForConnectModal}
            />
            <InstallSuccessModal
                isOpen={installSuccessStore !== null}
                onOpenChange={(open) => {
                    if (!open) setInstallSuccessStore(null)
                }}
                onViewActions={handleViewActions}
            />
        </div>
    )
}

type TrackstarConnectButtonProps = {
    integrationName: string
    isSubmitting: boolean
    onAuthCode: (authCode: string) => void | Promise<void>
}

function TrackstarConnectButton({
    integrationName,
    isSubmitting,
    onAuthCode,
}: TrackstarConnectButtonProps) {
    const { mutateAsync: createLink } = useLinkTrackstar()
    const { open } = useTrackstarLink({
        integrationAllowList: [integrationName],
        onSuccess: async (authCode: string) => {
            await onAuthCode(authCode)
        },
        getLinkToken: async () => {
            const res = await createLink({ connectionId: '' })
            return res.data.link_token
        },
    })
    return (
        <Button
            onClick={() => open({})}
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
        >
            Add credentials
        </Button>
    )
}

type AppCTAProps = AppDetailType & {
    onDisconnected?: () => void | Promise<void>
}

function AppCTA({
    alloyIntegrationId,
    isUnapproved,
    appId,
    isConnected,
    title,
    connectUrl,
    onDisconnected,
}: AppCTAProps) {
    const domain = useAppSelector(getCurrentAccountState).get('domain')

    const [isLoading, setLoading] = useState(false)
    const [isModalOpen, setModalOpen] = useState(false)

    const hasConnections = !isEmpty(
        useAppSelector(getIntegrationsByAppId(appId)),
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
            if (!isUninstalled) {
                throw new Error(`Not disconnected`)
            }
            toast.success(`${title} has been disconnected.`)
            await onDisconnected?.()
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
            ) : isConnected ? (
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
