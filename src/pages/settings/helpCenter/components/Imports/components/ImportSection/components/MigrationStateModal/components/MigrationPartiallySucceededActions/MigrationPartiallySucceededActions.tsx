import Button from 'pages/common/components/button/Button'

import { PartiallySucceededMigrationState } from '../../../../types'

import css from './MigrationPartiallySucceededActions.less'

type Props = {
    state: PartiallySucceededMigrationState
}

const MigrationPartiallySucceededActions: React.FC<Props> = ({ state }) => {
    const areButtonsDisabled = state.isRetryLoading || state.isRevertLoading

    return (
        <>
            <div className={css.title}>
                The migration did not fully succeed, you can:
            </div>

            <div className="mt-1 mb-3">
                <div className={css.optionRow}>
                    <Button
                        className={css.optionButton}
                        onClick={state.onRetry}
                        isLoading={state.isRetryLoading}
                        isDisabled={areButtonsDisabled}
                    >
                        <i className="material-icons mr-2">refresh</i>
                        Retry
                    </Button>
                    <div className={css.optionDescription}>
                        Start the migration again
                    </div>
                </div>
                <div className={css.optionRow}>
                    <Button
                        intent="destructive"
                        className={css.optionButton}
                        onClick={state.onRevert}
                        isLoading={state.isRevertLoading}
                        isDisabled={areButtonsDisabled}
                    >
                        <i className="material-icons mr-2">delete</i>
                        Revert
                    </Button>
                    <div className={css.optionDescription}>
                        Remove all imported content and restore to previous
                        state
                    </div>
                </div>
            </div>

            <Button
                className="w-100"
                isDisabled={areButtonsDisabled}
                onClick={state.onFinish}
                intent="secondary"
            >
                End migration
            </Button>
        </>
    )
}

export default MigrationPartiallySucceededActions
