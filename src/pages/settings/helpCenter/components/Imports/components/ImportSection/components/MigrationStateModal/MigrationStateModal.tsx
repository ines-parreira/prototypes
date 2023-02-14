import React, {useMemo} from 'react'
import classNames from 'classnames'
import {Progress} from 'reactstrap'
import {noop} from 'lodash'

import gorgiasLogo from 'assets/img/icons/gorgias-icon-logo-black.png'
import Button from 'pages/common/components/button/Button'

import {
    MigrationProviderMeta,
    MigrationState,
    MigrationStatus,
} from '../../types'

import MigrationProviderPair from '../MigrationProviderPair'
import MigrationBaseModal from '../MigrationBaseModal'
import MigrationBaseModalBody from '../MigrationBaseModalBody'

import css from './MigrationStateModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void

    provider: MigrationProviderMeta
    state: MigrationState
}

const actionButtonText: Record<MigrationStatus, string> = {
    [MigrationStatus.Connected]: 'Start migrating',
    [MigrationStatus.InProgress]: 'Loading',
    [MigrationStatus.Completed]: 'Finish',
}

const MigrationStateModal: React.FC<Props> = ({
    isOpen,
    onClose,
    provider,
    state,
}) => {
    const {status} = state

    const {actionButtonHandler, isActionButtonLoading, progressPercentage} =
        useMemo(() => {
            if (state.status === MigrationStatus.Connected) {
                return {
                    actionButtonHandler: state.onMigrationStart,
                    isActionButtonLoading: state.isMigrationStartLoading,
                    progressPercentage: 0,
                }
            }
            if (state.status === MigrationStatus.InProgress) {
                return {
                    actionButtonHandler: noop,
                    isActionButtonLoading: true,
                    progressPercentage: state.progress,
                }
            }

            return {
                actionButtonHandler: () => {
                    window.location.reload()
                },
                isActionButtonLoading: false,
                progressPercentage: 100,
            }
        }, [state])

    return (
        <MigrationBaseModal
            title={
                status === MigrationStatus.Completed
                    ? 'Migration complete'
                    : 'Start migration'
            }
            isOpen={isOpen}
            onClose={onClose}
        >
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
                <h3 className="text-center">
                    {status === MigrationStatus.Connected
                        ? `Migrate data from ${provider.title || ''} to Gorgias`
                        : `Migrating from ${provider.title || ''} to Gorgias`}
                </h3>
                <div className="mb-4"></div>

                {status === MigrationStatus.Connected ? (
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
                ) : (
                    <>
                        <div className={css.caption}>
                            {status === MigrationStatus.Completed
                                ? 'Completed'
                                : 'In progress'}
                        </div>
                        <div className="mb-1"></div>
                        <div className={css.progressLabel}>
                            {progressPercentage.toFixed(0)}% Complete
                        </div>
                        <div className="mb-1"></div>

                        <Progress
                            className={css.progress}
                            value={progressPercentage}
                            animated={status === MigrationStatus.InProgress}
                        />
                    </>
                )}
                <div className="mb-4"></div>

                <Button
                    className="w-100"
                    isLoading={isActionButtonLoading}
                    onClick={actionButtonHandler}
                >
                    {actionButtonText[status]}
                </Button>
                {state.status === MigrationStatus.Completed && (
                    <div className={classNames(css.caption, 'mt-2')}>
                        * To see the results, this will refresh the page
                    </div>
                )}
            </MigrationBaseModalBody>
        </MigrationBaseModal>
    )
}

export default MigrationStateModal
