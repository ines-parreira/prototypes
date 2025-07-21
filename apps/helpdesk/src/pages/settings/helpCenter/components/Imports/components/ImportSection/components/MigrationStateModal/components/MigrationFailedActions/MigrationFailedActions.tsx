import cn from 'classnames'

import Button from 'pages/common/components/button/Button'

import { FailedMigrationState } from '../../../../types'

import css from './MigrationFailedActions.less'

type Props = {
    state: FailedMigrationState
}

const MigrationFailedActions: React.FC<Props> = ({ state }) => {
    return (
        <>
            <div className={css.title}>
                <i className={cn(css.warningIcon, 'material-icons', 'mr-2')}>
                    warning
                </i>
                The migration completely failed
            </div>
            <div className="mb-4"></div>
            <div className={css.actions}>
                <Button
                    className={css.actionsButton}
                    isLoading={state.isRetryLoading}
                    onClick={state.onRetry}
                >
                    <i className="material-icons mr-2">refresh</i>
                    Retry
                </Button>
                <Button
                    intent="secondary"
                    className={css.actionsButton}
                    isDisabled={state.isRetryLoading}
                    onClick={state.onFinish}
                >
                    Close
                </Button>
            </div>
        </>
    )
}

export default MigrationFailedActions
