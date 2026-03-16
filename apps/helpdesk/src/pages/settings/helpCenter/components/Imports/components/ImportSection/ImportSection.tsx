import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useAsyncFn } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import classnames from 'classnames'
import type { Map } from 'immutable'
import { ParamType } from 'openapi-client-axios'
import { useHistory } from 'react-router-dom'

import {
    LegacyButton as Button,
    LegacyLoadingSpinner as LoadingSpinner,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useMigrationApi } from 'pages/settings/helpCenter/hooks/useMigrationApi'
import settingsCss from 'pages/settings/settings.less'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { GorgiasAppAuthService } from 'utils/gorgiasAppsAuth'

import { CSV_MIGRATION_PROVIDER_TYPE } from '../CsvColumnMatching/utils'
import ImportArticlesModal from './components/ImportArticlesModal'
import MigrationCredentialsModal from './components/MigrationCredentialsModal'
import MigrationStateModal from './components/MigrationStateModal'
import ProviderSelectModal from './components/ProviderSelectModal'
import { csvProviderMeta } from './csv-provider-meta'
import type {
    AutoOpenSessionLocationState,
    FetchedMigrationSessionState,
    FetchedProvidersState,
    HelpCenterMigrationConfig,
    ImportArticlesModalState,
    MigrationProviderType,
    MigrationStartPayload,
    MigrationState,
} from './types'
import { MigrationSessionStatus, MigrationStatus } from './types'
import {
    getErrorMessage,
    getSessionCreateData,
    longNotificationOptions,
    notificationRefreshButton,
    parseSessionStats,
    responseIsSession,
    responseIsSessionsList,
    sessionHasProgressStatus,
} from './utils'

import css from './ImportSection.less'

type Props = {
    className?: string
    isDisabled?: boolean
    isButton?: boolean
    buttonLabel?: string
}

export const ACTIVE_MIGRATION_UPDATE_TIMEOUT = 3 * 1000

export const ImportSection: React.FC<Props> = ({
    className,
    isDisabled,
    isButton,
    buttonLabel,
}: Props) => {
    const dispatch = useAppDispatch()
    const migrationClient = useMigrationApi()
    const currentHelpCenter = useCurrentHelpCenter()
    const history = useHistory()
    const authServiceRef = useRef(new GorgiasAppAuthService())

    const _migrationConfig = useFlag<HelpCenterMigrationConfig>(
        FeatureFlagKey.HelpCenterMigrationConfig,
    )

    const migrationConfigProviders = useMemo(
        () => _migrationConfig?.providers || [], // in case of invalid value
        [_migrationConfig],
    )

    // Using as state in case no providers from API match the ones from the feature flag
    const [isMigrationAvailable, setIsMigrationAvailable] = useState(
        !!migrationConfigProviders.length,
    )

    const [importArticlesModalState, setImportArticlesModalState] =
        useState<ImportArticlesModalState | null>(null)
    const [providerSelectModalOpen, setProviderSelectModalOpen] =
        useState(false)
    const [selectedProviderType, setSelectedProviderType] =
        useState<MigrationProviderType>()
    const [migrationStartPayload, setMigrationStartPayload] =
        useState<MigrationStartPayload>()
    const [migrationStateModalOpen, setMigrationStateModalOpen] =
        useState(false)

    // Using ref because we need this value in a promise callback
    const migrationStateModalOpenRef = useRef(migrationStateModalOpen)
    migrationStateModalOpenRef.current = migrationStateModalOpen

    const [fetchedProviders, setFetchedProviders] =
        useState<FetchedProvidersState>({
            data: null,
            isLoading: isMigrationAvailable,
            isError: false,
        })
    /**
     * The migration session that is currently in progress
     */
    const [currentMigrationSession, setCurrentMigrationSession] =
        useState<FetchedMigrationSessionState>({
            data: null,
            isFirstTimeLoading: isMigrationAvailable,
        })

    const isUpdatingActiveMigrationRef = useRef(false)

    const isImportInProgress = sessionHasProgressStatus(
        currentMigrationSession.data,
    )

    const selectedProvider = fetchedProviders.data?.find(
        (provider) => provider.type === selectedProviderType,
    )

    const canRenderMigrationStateModal =
        currentMigrationSession.data || migrationStartPayload

    const [{ loading: isMigrationConnectionLoading }, handleMigrationConnect] =
        useAsyncFn(
            async (data: Map<string, string>) => {
                if (!migrationClient || !selectedProviderType) return

                try {
                    await migrationClient.sessionCreate(
                        // Check parameter used to just verify validity of credentials
                        [{ name: 'check', value: 'true', in: ParamType.Query }],
                        getSessionCreateData(
                            currentHelpCenter.id,
                            {
                                type: selectedProviderType,
                                ...data.toJS(),
                            },
                            // the gorgias apps token is prefixed with Bearer, strip it for the payload
                            (
                                await authServiceRef.current.getAccessToken()
                            )?.replace('Bearer ', '') || '',
                        ),
                    )

                    setSelectedProviderType(undefined)
                    setMigrationStateModalOpen(true)
                    setMigrationStartPayload({
                        type: selectedProviderType,
                        ...data.toJS(),
                    })
                } catch (error) {
                    let message = "Couldn't connect to provider"
                    if (selectedProvider?.title) {
                        message += ' ' + selectedProvider.title
                    }

                    const errorMessage = getErrorMessage(error)
                    if (errorMessage) message += ': ' + errorMessage

                    void dispatch(
                        notify({ message, status: NotificationStatus.Error }),
                    )
                }
            },
            [migrationClient, selectedProviderType],
        )

    const [{ loading: isMigrationStartLoading }, handleMigrationStart] =
        useAsyncFn(async () => {
            if (!migrationClient || !migrationStartPayload) return

            try {
                const { data: createdSession } =
                    await migrationClient.sessionCreate(
                        undefined,
                        getSessionCreateData(
                            currentHelpCenter.id,
                            migrationStartPayload,
                            // the gorgias apps token is prefixed with Bearer, strip it for the payload
                            (
                                await authServiceRef.current.getAccessToken()
                            )?.replace('Bearer ', '') || '',
                        ),
                    )

                if (!responseIsSession(createdSession)) return

                setMigrationStartPayload(undefined)
                setMigrationStateModalOpen(true)
                setCurrentMigrationSession({
                    data: createdSession,
                    isFirstTimeLoading: false,
                })
            } catch (error) {
                let message = 'Failed to start migration'

                const errorMessage = getErrorMessage(error)
                if (errorMessage) message += ': ' + errorMessage

                void dispatch(
                    notify({ message, status: NotificationStatus.Error }),
                )
            }
        }, [migrationClient, migrationStartPayload])

    const [{ loading: isRevertLoading }, handleRevert] =
        useAsyncFn(async () => {
            if (!migrationClient || !currentMigrationSession.data) return

            try {
                const { data: resultingRevertSession } =
                    await migrationClient.sessionRollback({
                        uuid: currentMigrationSession.data.session_id,
                    })

                if (!responseIsSession(resultingRevertSession)) return

                setMigrationStateModalOpen(true) // In case the user closed the modal while loading
                setCurrentMigrationSession({
                    data: resultingRevertSession,
                    isFirstTimeLoading: false,
                })
            } catch (error) {
                let message = 'Failed to revert migration'

                const errorMessage = getErrorMessage(error)
                if (errorMessage) message += ': ' + errorMessage

                void dispatch(
                    notify({ message, status: NotificationStatus.Error }),
                )
            }
        }, [migrationClient, migrationStartPayload, currentMigrationSession])

    const [{ loading: isRetryLoading }, handleRetry] = useAsyncFn(async () => {
        if (!migrationClient || !currentMigrationSession.data) return

        try {
            const { data: resultingSession } =
                await migrationClient.sessionRetry({
                    uuid: currentMigrationSession.data.session_id,
                })
            if (!responseIsSession(resultingSession)) return

            setMigrationStateModalOpen(true) // In case the user closed the modal while loading
            setCurrentMigrationSession({
                data: resultingSession,
                isFirstTimeLoading: false,
            })
        } catch (error) {
            let message = 'Failed to retry migration'

            const errorMessage = getErrorMessage(error)
            if (errorMessage) message += ': ' + errorMessage

            void dispatch(notify({ message, status: NotificationStatus.Error }))
        }
    }, [migrationClient, migrationStartPayload, currentMigrationSession])

    useEffect(() => {
        if (!migrationClient || !isMigrationAvailable) return

        const locationState = history.location
            .state as AutoOpenSessionLocationState

        if (locationState?.autoOpenSession) {
            setCurrentMigrationSession({
                isFirstTimeLoading: false,
                data: locationState.autoOpenSession,
            })
            setMigrationStateModalOpen(true)

            // Clear the location state after opening modal without rerendering
            window.history.replaceState(null, '')
            return
        }

        void (async () => {
            try {
                const { data: sessions } = await migrationClient.sessionList([
                    {
                        name: 'help_center_id',
                        value: currentHelpCenter.id,
                        in: ParamType.Query,
                    },
                ])
                if (!(sessions instanceof Array)) return
                if (!responseIsSessionsList(sessions)) return

                const activeSession = sessions.find((session) =>
                    sessionHasProgressStatus(session),
                )

                if (activeSession) {
                    setCurrentMigrationSession({
                        isFirstTimeLoading: false,
                        data: activeSession,
                    })
                    void dispatch(
                        notify({
                            message:
                                'There is an ongoing migration in the background, you can start a new one once it is finished',
                        }),
                    )
                } else {
                    setCurrentMigrationSession({
                        isFirstTimeLoading: false,
                        data: null,
                    })
                }
            } catch (error) {
                let message =
                    "We're facing some problems retrieving active migrations"

                const errorMessage = getErrorMessage(error)
                if (errorMessage) message += ': ' + errorMessage

                setCurrentMigrationSession({
                    isFirstTimeLoading: false,
                    data: null,
                })
                void dispatch(
                    notify({
                        message: message,
                        status: NotificationStatus.Error,
                        ...longNotificationOptions,
                    }),
                )
            }
        })()
    }, [
        currentHelpCenter.id,
        dispatch,
        history.location.state,
        isMigrationAvailable,
        migrationClient,
        setCurrentMigrationSession,
    ])

    const updateActiveMigrationSession = useCallback(async () => {
        if (!migrationClient || !currentMigrationSession.data) return

        let migrationFailed = false

        try {
            const { data: session } = await migrationClient.sessionRetrieve(
                currentMigrationSession.data.session_id,
            )
            if (!responseIsSession(session)) return

            if (sessionHasProgressStatus(session)) {
                setCurrentMigrationSession({
                    data: session,
                    isFirstTimeLoading: false,
                })
                return
            }

            if (session.status === MigrationSessionStatus.Success) {
                // Show notification only if state modal is not open
                if (!migrationStateModalOpenRef.current) {
                    void dispatch(
                        notify({
                            message:
                                'The migration finished successfully, to see the results refresh the page',
                            buttons: [notificationRefreshButton],
                            status: NotificationStatus.Success,
                        }),
                    )
                    setCurrentMigrationSession({
                        data: null,
                        isFirstTimeLoading: false,
                    })
                } else {
                    setCurrentMigrationSession({
                        data: session,
                        isFirstTimeLoading: false,
                    })
                }
            } else {
                migrationFailed = true
            }
        } catch {
            // In case of a server error
            migrationFailed = true
        }

        if (migrationFailed) {
            void dispatch(
                notify({
                    message:
                        'The migration failed to finish importing all articles, some of them might be missing, to see the results refresh the page',
                    status: NotificationStatus.Error,
                    buttons: [notificationRefreshButton],
                    ...longNotificationOptions,
                }),
            )
            setCurrentMigrationSession({
                data: null,
                isFirstTimeLoading: false,
            })
        }
    }, [
        dispatch,
        currentMigrationSession.data,
        migrationClient,
        setCurrentMigrationSession,
    ])

    // Periodically update the migration session progress
    useEffect(() => {
        if (
            isUpdatingActiveMigrationRef.current ||
            !sessionHasProgressStatus(currentMigrationSession.data) ||
            !isMigrationAvailable
        )
            return

        isUpdatingActiveMigrationRef.current = true
        setTimeout(() => {
            void updateActiveMigrationSession()
            isUpdatingActiveMigrationRef.current = false
        }, ACTIVE_MIGRATION_UPDATE_TIMEOUT)
    }, [
        currentMigrationSession.data,
        isMigrationAvailable,
        updateActiveMigrationSession,
    ])

    const parsedSessionStats = useMemo(() => {
        if (currentMigrationSession.data?.is_rollback) return null
        return parseSessionStats(currentMigrationSession.data)
    }, [currentMigrationSession.data])

    const migrationStateModalState = useMemo((): MigrationState => {
        if (migrationStartPayload) {
            return {
                status: MigrationStatus.Connected,
                onMigrationStart: handleMigrationStart,
                isMigrationStartLoading,
            }
        }

        const currentSession = currentMigrationSession.data
        if (isImportInProgress) {
            return {
                status: MigrationStatus.InProgress,
                progress: currentSession?.result?.progress || 0,
            }
        }

        const onFinish = () => {
            history?.go(0)
        }

        if (currentSession?.is_rollback) {
            return {
                status: MigrationStatus.Succeeded,
                onFinish,
            }
        }

        if (
            parsedSessionStats?.totalImported ===
            parsedSessionStats?.totalExported
        ) {
            return {
                status: MigrationStatus.Succeeded,
                onFinish,
            }
        }
        if (
            parsedSessionStats?.totalFailed ===
            parsedSessionStats?.totalExported
        ) {
            return {
                status: MigrationStatus.Failed,
                onRetry: handleRetry,
                isRetryLoading,
                onFinish,
            }
        }
        return {
            status: MigrationStatus.PartiallySucceeded,
            onRetry: handleRetry,
            isRetryLoading,
            onRevert: handleRevert,
            isRevertLoading,
            onFinish,
        }
    }, [
        currentMigrationSession.data,
        handleMigrationStart,
        handleRetry,
        handleRevert,
        isImportInProgress,
        isMigrationStartLoading,
        isRetryLoading,
        isRevertLoading,
        migrationStartPayload,
        parsedSessionStats,
        history,
    ])

    const handleMigrationStateModalClose = () => {
        setMigrationStateModalOpen(false)

        // Canceling the migration before clicking start (if it already started this will have no effect)
        if (migrationStartPayload) setMigrationStartPayload(undefined)

        if (migrationStateModalState.status === MigrationStatus.InProgress) {
            void dispatch(
                notify({
                    message:
                        'The migration has started, you’ll get notified on this page once it is finished',
                }),
            )
        }

        // If the session is completed we can forget about it
        if (currentMigrationSession.data?.status === 'SUCCESS')
            setCurrentMigrationSession({
                data: null,
                isFirstTimeLoading: false,
            })
    }

    useEffect(() => {
        if (!migrationClient || !isMigrationAvailable) return

        void (async () => {
            try {
                const { data: allProviders } =
                    await migrationClient.providerStaticList()
                if (!(allProviders instanceof Array)) return

                const availableProviders = allProviders.filter((provider) =>
                    migrationConfigProviders.includes(provider.type),
                )
                if (availableProviders.length) {
                    setFetchedProviders({
                        data: availableProviders,
                        isLoading: false,
                        isError: false,
                    })
                } else {
                    setFetchedProviders({
                        data: null,
                        isLoading: false,
                        isError: false,
                    })
                    setIsMigrationAvailable(false)
                }
            } catch (error) {
                let message =
                    "We're facing some issues with migration providers, please contact support"

                const errorMessage = getErrorMessage(error)
                if (errorMessage) message += ': ' + errorMessage

                setFetchedProviders({
                    data: null,
                    isLoading: false,
                    isError: true,
                })
                void dispatch(
                    notify({
                        message: message,
                        status: NotificationStatus.Error,
                        ...longNotificationOptions,
                    }),
                )
            }
        })()
    }, [
        dispatch,
        isMigrationAvailable,
        migrationClient,
        setFetchedProviders,
        migrationConfigProviders,
    ])

    const migrationStateProvider = useMemo(() => {
        // Feed the provider that was selected for the migration start to the MigrationStateModal
        if (migrationStartPayload) {
            return fetchedProviders.data?.find(
                (provider) => provider.type === migrationStartPayload?.type,
            )
        }
        // When the session is in progress or completed feed the provider from the session to the MigrationStateModal
        if (currentMigrationSession.data) {
            if (
                currentMigrationSession.data.session.migration.provider.type ===
                CSV_MIGRATION_PROVIDER_TYPE
            ) {
                return csvProviderMeta
            }
            return currentMigrationSession.data.session.migration.provider.meta
        }
    }, [
        migrationStartPayload,
        currentMigrationSession.data,
        fetchedProviders.data,
    ])

    const handleMoreDetailsClick = () => {
        setMigrationStateModalOpen(true)
    }

    const handleImportButtonClick = () => {
        setImportArticlesModalState({
            state: 'NO_FILE_SELECTED',
        })
        logEvent(SegmentEvent.HelpCenterTemplatesImportButtonClicked)
    }

    return (
        <>
            {isButton ? (
                <>
                    <Button
                        id="import-button"
                        isDisabled={
                            isImportInProgress ||
                            isDisabled ||
                            currentMigrationSession.isFirstTimeLoading
                        }
                        intent="secondary"
                        onClick={handleImportButtonClick}
                        className={css.button}
                    >
                        {buttonLabel || (
                            <i className="material-icons">cloud_upload</i>
                        )}
                    </Button>
                    <Tooltip
                        target="import-button"
                        placement="top"
                        innerProps={{
                            innerClassName: css.tooltip,
                        }}
                        autohide={false}
                    >
                        Import articles from another Help Center
                    </Tooltip>
                </>
            ) : (
                <section className={classnames(className, settingsCss.mb40)}>
                    <h4>Import articles from another Help Center</h4>

                    <p>
                        You can import CSV files with articles from another Help
                        Center.
                    </p>

                    {isImportInProgress && (
                        <div
                            data-testid="import-in-progress-info"
                            className={css.importInProgressContainer}
                        >
                            <div>
                                <LoadingSpinner
                                    size="small"
                                    className={css.spinner}
                                />
                                Import in progress
                            </div>

                            <span
                                onClick={handleMoreDetailsClick}
                                className={css.moreDetails}
                                data-testid="import-in-progress-more-details-trigger"
                            >
                                More Details
                            </span>
                        </div>
                    )}

                    {!isImportInProgress && (
                        <Button
                            isDisabled={
                                // Don't allow to open import modal while checking if there's an active migration session
                                isDisabled ||
                                currentMigrationSession.isFirstTimeLoading
                            }
                            isLoading={
                                currentMigrationSession.isFirstTimeLoading
                            }
                            intent="secondary"
                            onClick={() =>
                                setImportArticlesModalState({
                                    state: 'NO_FILE_SELECTED',
                                })
                            }
                        >
                            {!currentMigrationSession.isFirstTimeLoading && (
                                <i className="material-icons mr-2">
                                    cloud_upload
                                </i>
                            )}
                            {currentMigrationSession.isFirstTimeLoading
                                ? 'Checking for migrations'
                                : 'Import Articles'}
                        </Button>
                    )}
                </section>
            )}

            <ImportArticlesModal
                isMigrationAvailable={isMigrationAvailable}
                isOpen={importArticlesModalState !== null}
                onClose={() => setImportArticlesModalState(null)}
                fetchedProviders={fetchedProviders}
                modalState={importArticlesModalState}
                onImportStart={() => {
                    setImportArticlesModalState({
                        state: 'IMPORTING',
                    })
                }}
                onFileSelect={(file) => {
                    setImportArticlesModalState({
                        state: 'FILE_SELECTED',
                        file,
                    })
                }}
                onFileRemove={() => {
                    setImportArticlesModalState({
                        state: 'NO_FILE_SELECTED',
                    })
                }}
                onMigrationDropAreaClick={() => {
                    setImportArticlesModalState(null)
                    setProviderSelectModalOpen(true)
                }}
            />
            {isMigrationAvailable && (
                <>
                    {fetchedProviders.data && (
                        <ProviderSelectModal
                            isOpen={providerSelectModalOpen}
                            onClose={() => setProviderSelectModalOpen(false)}
                            providers={fetchedProviders.data}
                            onProviderSelect={setSelectedProviderType}
                        />
                    )}
                    {selectedProvider && (
                        <MigrationCredentialsModal
                            isOpen={!!selectedProvider}
                            onClose={() => setSelectedProviderType(undefined)}
                            provider={selectedProvider}
                            onSubmit={handleMigrationConnect}
                            isLoading={isMigrationConnectionLoading}
                        />
                    )}
                    {canRenderMigrationStateModal && migrationStateProvider && (
                        <MigrationStateModal
                            isOpen={migrationStateModalOpen}
                            onClose={handleMigrationStateModalClose}
                            provider={migrationStateProvider}
                            state={migrationStateModalState}
                            stats={parsedSessionStats}
                            isRevert={currentMigrationSession.data?.is_rollback}
                        />
                    )}
                </>
            )}
        </>
    )
}

export default ImportSection
