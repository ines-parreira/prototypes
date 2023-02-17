import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useAsyncFn, useSetState} from 'react-use'
import {Spinner} from 'reactstrap'
import {ParamType} from 'openapi-client-axios'

import {Map} from 'immutable'

import classnames from 'classnames'

import {useFlags} from 'launchdarkly-react-client-sdk'
import settingsCss from 'pages/settings/settings.less'
import Button from 'pages/common/components/button/Button'
import {useMigrationApi} from 'pages/settings/helpCenter/hooks/useMigrationApi'
import Tooltip from 'pages/common/components/Tooltip'
import {useCurrentHelpCenter} from 'pages/settings/helpCenter/providers/CurrentHelpCenter'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import useAppDispatch from 'hooks/useAppDispatch'

import {getAccessToken} from 'rest_api/utils'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    FetchedMigrationSessionState,
    FetchedProvidersState,
    ImportArticlesModalState,
    MigrationProviderType,
    MigrationSessionStatus,
    MigrationStartPayload,
    MigrationState,
    MigrationStatus,
} from './types'
import {
    getSessionCreateData,
    longNotificationOptions,
    notificationRefreshButton,
    sessionHasProgressStatus,
} from './utils'

import ImportArticlesModal from './components/ImportArticlesModal'
import ProviderSelectModal from './components/ProviderSelectModal'
import MigrationCredentialsModal from './components/MigrationCredentialsModal'
import MigrationStateModal from './components/MigrationStateModal'

import css from './ImportSection.less'

type Props = {
    className?: string
    isDisabled?: boolean
    isButton?: boolean
}

export const ACTIVE_MIGRATION_UPDATE_TIMEOUT = 3 * 1000

export const ImportSection: React.FC<Props> = ({
    className,
    isDisabled,
    isButton,
}: Props) => {
    const dispatch = useAppDispatch()
    const migrationClient = useMigrationApi()
    const currentHelpCenter = useCurrentHelpCenter()

    const isMigrationAvailable =
        !!useFlags()[FeatureFlagKey.HelpCenterZendeskImportCTA]

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
        useSetState<FetchedProvidersState>({
            data: null,
            isLoading: isMigrationAvailable,
            isError: false,
        })
    /**
     * The migration session that is currently in progress
     */
    const [fetchedMigrationSession, setFetchedMigrationSession] =
        useSetState<FetchedMigrationSessionState>({
            data: null,
            isFirstTimeLoading: isMigrationAvailable,
        })

    const isUpdatingActiveMigrationRef = useRef(false)

    const isImportInProgress = sessionHasProgressStatus(
        fetchedMigrationSession.data
    )

    const selectedProvider = fetchedProviders.data?.find(
        (provider) => provider.type === selectedProviderType
    )

    const canRenderMigrationStateModal =
        fetchedMigrationSession.data || migrationStartPayload

    const [{loading: isMigrationConnectionLoading}, handleMigrationConnect] =
        useAsyncFn(
            async (data: Map<string, string>) => {
                if (!migrationClient || !selectedProviderType) return

                try {
                    await migrationClient.sessionCreate(
                        // Check parameter used to just verify validity of credentials
                        [{name: 'check', value: 'true', in: ParamType.Query}],
                        getSessionCreateData(
                            currentHelpCenter.id,
                            {
                                type: selectedProviderType,
                                ...data.toJS(),
                            },
                            (await getAccessToken()) || ''
                        )
                    )

                    setSelectedProviderType(undefined)
                    setMigrationStateModalOpen(true)
                    setMigrationStartPayload({
                        type: selectedProviderType,
                        ...data.toJS(),
                    })
                } catch (e) {
                    void dispatch(
                        notify({
                            message: `Couldn't connect to provider: ${
                                selectedProvider?.title || '<unkown>'
                            }`,
                            status: NotificationStatus.Error,
                        })
                    )
                }
            },
            [migrationClient, selectedProviderType]
        )

    const [{loading: isMigrationStartLoading}, handleMigrationStart] =
        useAsyncFn(async () => {
            if (!migrationClient || !migrationStartPayload) return

            try {
                const {data: createdSession} =
                    await migrationClient.sessionCreate(
                        undefined,
                        getSessionCreateData(
                            currentHelpCenter.id,
                            migrationStartPayload,
                            (await getAccessToken(true)) || ''
                        )
                    )

                if (!('status' in createdSession)) return

                setMigrationStartPayload(undefined)
                setMigrationStateModalOpen(true)
                setFetchedMigrationSession({
                    data: createdSession,
                })
            } catch (e) {
                void dispatch(
                    notify({
                        message: `Failed to start migration`,
                        status: NotificationStatus.Error,
                    })
                )
            }
        }, [migrationClient, migrationStartPayload])

    useEffect(() => {
        if (!migrationClient || !isMigrationAvailable) return
        void (async () => {
            try {
                const {data: sessions} = await migrationClient.sessionList([
                    {
                        name: 'help_center_id',
                        value: currentHelpCenter.id,
                        in: ParamType.Query,
                    },
                ])
                if (!(sessions instanceof Array)) return

                const activeSession = sessions.find((session) =>
                    sessionHasProgressStatus(session)
                )

                if (activeSession) {
                    setFetchedMigrationSession({
                        isFirstTimeLoading: false,
                        data: activeSession,
                    })
                    void dispatch(
                        notify({
                            message:
                                'There is an ongoing migration in the background, you can start a new one once it is finished',
                        })
                    )
                } else {
                    setFetchedMigrationSession({
                        isFirstTimeLoading: false,
                    })
                }
            } catch (e) {
                setFetchedMigrationSession({
                    isFirstTimeLoading: false,
                })
                void dispatch(
                    notify({
                        message:
                            "We're facing some problems retrieving active migrations",
                        status: NotificationStatus.Error,
                        ...longNotificationOptions,
                    })
                )
            }
        })()
    }, [
        currentHelpCenter.id,
        dispatch,
        isMigrationAvailable,
        migrationClient,
        setFetchedMigrationSession,
    ])

    const updateActiveMigrationSession = useCallback(async () => {
        if (!migrationClient || !fetchedMigrationSession.data) return

        let migrationFailed = false

        try {
            const {data: session} = await migrationClient.sessionRetrieve(
                fetchedMigrationSession.data.session_id
            )
            if (!('status' in session)) return

            if (sessionHasProgressStatus(session)) {
                setFetchedMigrationSession({data: session})
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
                        })
                    )
                    setFetchedMigrationSession({data: null})
                } else {
                    setFetchedMigrationSession({data: session})
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
                })
            )
            setFetchedMigrationSession({data: null})
        }
    }, [
        dispatch,
        fetchedMigrationSession.data,
        migrationClient,
        setFetchedMigrationSession,
    ])

    // Periodically update the migration session progress
    useEffect(() => {
        if (
            isUpdatingActiveMigrationRef.current ||
            !sessionHasProgressStatus(fetchedMigrationSession.data) ||
            !isMigrationAvailable
        )
            return

        isUpdatingActiveMigrationRef.current = true
        setTimeout(() => {
            void updateActiveMigrationSession()
            isUpdatingActiveMigrationRef.current = false
        }, ACTIVE_MIGRATION_UPDATE_TIMEOUT)
    }, [
        fetchedMigrationSession.data,
        isMigrationAvailable,
        updateActiveMigrationSession,
    ])

    const migrationStateModalState: MigrationState = useMemo(() => {
        if (migrationStartPayload) {
            return {
                status: MigrationStatus.Connected,
                onMigrationStart: handleMigrationStart,
                isMigrationStartLoading,
            }
        }
        if (isImportInProgress) {
            return {
                status: MigrationStatus.InProgress,
                progress: fetchedMigrationSession.data?.result?.progress || 0,
            }
        }
        return {
            status: MigrationStatus.Completed,
        }
    }, [
        fetchedMigrationSession.data?.result?.progress,
        handleMigrationStart,
        isImportInProgress,
        isMigrationStartLoading,
        migrationStartPayload,
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
                })
            )
        }

        // If the session is completed we can forget about it
        if (fetchedMigrationSession.data?.status === 'SUCCESS')
            setFetchedMigrationSession({
                data: null,
                isFirstTimeLoading: false,
            })
    }

    useEffect(() => {
        if (!migrationClient || !isMigrationAvailable) return

        void (async () => {
            try {
                const {data} = await migrationClient.providerStaticList()
                if (!(data instanceof Array)) return
                setFetchedProviders({
                    data,
                    isLoading: false,
                })
            } catch (e) {
                setFetchedProviders({
                    isLoading: false,
                    isError: true,
                })
                void dispatch(
                    notify({
                        message:
                            "We're facing some issues with migration providers, please contact support",
                        status: NotificationStatus.Error,
                        ...longNotificationOptions,
                    })
                )
            }
        })()
    }, [dispatch, isMigrationAvailable, migrationClient, setFetchedProviders])

    const migrationStateProvider = useMemo(() => {
        // Feed the provider that was selected for the migration start to the MigrationStateModal
        if (migrationStartPayload) {
            return fetchedProviders.data?.find(
                (provider) => provider.type === migrationStartPayload?.type
            )
        }
        // When the session is in progress or completed feed the provider from the session to the MigrationStateModal
        if (fetchedMigrationSession.data) {
            return fetchedMigrationSession.data.session.migration.provider.meta
        }
    }, [
        migrationStartPayload,
        fetchedMigrationSession.data,
        fetchedProviders.data,
    ])

    const handleMoreDetailsClick = () => {
        setMigrationStateModalOpen(true)
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
                            fetchedMigrationSession.isFirstTimeLoading
                        }
                        intent="secondary"
                        onClick={() =>
                            setImportArticlesModalState({
                                state: 'NO_FILE_SELECTED',
                            })
                        }
                        className={css.button}
                    >
                        <i className="material-icons">cloud_upload</i>
                    </Button>
                    <Tooltip
                        target="import-button"
                        placement="top"
                        innerClassName={css.tooltip}
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
                                <Spinner
                                    size="sm"
                                    color="primary"
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
                                fetchedMigrationSession.isFirstTimeLoading
                            }
                            isLoading={
                                fetchedMigrationSession.isFirstTimeLoading
                            }
                            intent="secondary"
                            onClick={() =>
                                setImportArticlesModalState({
                                    state: 'NO_FILE_SELECTED',
                                })
                            }
                        >
                            {!fetchedMigrationSession.isFirstTimeLoading && (
                                <i className="material-icons mr-2">
                                    cloud_upload
                                </i>
                            )}
                            {fetchedMigrationSession.isFirstTimeLoading
                                ? 'Checking for migrations'
                                : 'Import Articles'}
                        </Button>
                    )}
                </section>
            )}

            <ImportArticlesModal
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
                        />
                    )}
                </>
            )}
        </>
    )
}

export default ImportSection
