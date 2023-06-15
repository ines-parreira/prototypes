import React, {useMemo} from 'react'
import classNames from 'classnames'

import gorgiasLogo from 'assets/img/icons/gorgias-icon-logo-black.png'

import {
    MigrationProviderMeta,
    MigrationState,
    MigrationStatus,
} from '../../types'
import {ParsedSessionStats} from '../../utils'

import MigrationProviderPair from '../MigrationProviderPair'
import MigrationBaseModal from '../MigrationBaseModal'
import MigrationBaseModalBody from '../MigrationBaseModalBody'

import MigrationQuickSummary from './components/MigrationQuickSummary'
import MigrationFailuresDetails from './components/MigrationFailuresDetails'
import MigrationSucceededActions from './components/MigrationSucceededActions'
import MigrationInProgressActions from './components/MigrationInProgressActions'
import MigrationConnectedActions from './components/MigrationConnectedActions'
import MigrationPartiallySucceededActions from './components/MigrationPartiallySucceededActions'
import MigrationFailedActions from './components/MigrationFailedActions'

import css from './MigrationStateModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void

    provider: MigrationProviderMeta
    state: MigrationState
    stats: ParsedSessionStats | null
    isRevert?: boolean
}

const MigrationStateModal: React.FC<Props> = ({
    isOpen,
    onClose,
    provider,
    state,
    stats,
    isRevert,
}) => {
    const {status} = state

    const migrationDidEnd = ![
        MigrationStatus.Connected,
        MigrationStatus.InProgress,
    ].includes(status)

    const title = useMemo(() => {
        if (isRevert)
            return migrationDidEnd
                ? 'Migration reverted'
                : 'Reverting migration'
        return migrationDidEnd ? 'Migration end' : 'Start migration'
    }, [migrationDidEnd, isRevert])

    const description = useMemo(() => {
        if (isRevert) return `Reverting migration from ${provider.title || ''}`
        return status === MigrationStatus.Connected
            ? `Migrate data from ${provider.title || ''} to Gorgias`
            : `Migrating from ${provider.title || ''} to Gorgias`
    }, [status, isRevert, provider])

    const actions = useMemo(() => {
        switch (state.status) {
            case MigrationStatus.Connected:
                return <MigrationConnectedActions state={state} />
            case MigrationStatus.InProgress:
                return (
                    <MigrationInProgressActions
                        state={state}
                        progressClassName={css.progress}
                        progressLabelClassName={css.progressLabel}
                    />
                )
            case MigrationStatus.Succeeded:
                return (
                    <MigrationSucceededActions
                        state={state}
                        progressClassName={css.progress}
                        progressLabelClassName={css.progressLabel}
                    />
                )
            case MigrationStatus.PartiallySucceeded:
                return <MigrationPartiallySucceededActions state={state} />
            case MigrationStatus.Failed:
                return <MigrationFailedActions state={state} />
            default:
                return null
        }
    }, [state])

    return (
        <MigrationBaseModal title={title} isOpen={isOpen} onClose={onClose}>
            <MigrationBaseModalBody>
                <MigrationProviderPair
                    left={{
                        src: provider.logo_url || '',
                        alt: provider.title || '',
                    }}
                    right={{
                        src: gorgiasLogo,
                        alt: 'Gorgias',
                    }}
                />
                <div className="mb-4"></div>
                <h3 className="text-center">{description}</h3>
                <div className="mb-4"></div>

                {status === MigrationStatus.Connected ? (
                    <>
                        <div className={css.checkInfoContainer}>
                            <i
                                className={classNames(
                                    css.checkIcon,
                                    'material-icons'
                                )}
                            >
                                check
                            </i>
                            <div>
                                <h4 className="m-0">Connected accounts</h4>
                                <p>
                                    You have connected your accounts to{' '}
                                    {provider.title}.
                                </p>
                            </div>
                        </div>
                        <div className="mb-4"></div>
                    </>
                ) : (
                    stats && (
                        <>
                            <MigrationQuickSummary
                                title="Quick summary"
                                providerName={provider.title || ''}
                                entries={stats.quickSummaryEntries}
                            />
                            <div className="mb-2"></div>
                            <MigrationFailuresDetails
                                title="See what failed to import"
                                sections={stats.failuresSections}
                            />
                            <div className="mb-4"></div>
                        </>
                    )
                )}
                {actions}
            </MigrationBaseModalBody>
        </MigrationBaseModal>
    )
}

export default MigrationStateModal
