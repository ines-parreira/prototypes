import React from 'react'

import classNames from 'classnames'
import { useHistory } from 'react-router-dom'

import migrationCompleteIcon from 'assets/img/integrations/email-migration-complete.svg'
import Button from 'pages/common/components/button/Button'

import css from './MigrationComplete.less'

export default function MigrationComplete() {
    const history = useHistory()

    return (
        <div className={css.container} data-testid="migration-complete">
            <img
                src={migrationCompleteIcon}
                className={css.migrationCompleteIcon}
                alt="All done"
            />
            <div className={css.heading}>
                <i className={classNames('material-icons', css.checkIcon)}>
                    check_circle
                </i>
                <h1>Migration complete</h1>
            </div>
            <div className={css.description}>
                <p>
                    <strong>
                        You have no email integrations that need to be migrated.
                    </strong>
                </p>
                <p>You may continue sending and receiving emails as usual.</p>
            </div>
            <Button
                onClick={() => {
                    history.push('/app/settings/channels/email')
                }}
            >
                Go home
            </Button>
        </div>
    )
}
