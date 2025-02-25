import React from 'react'

import classnames from 'classnames'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

import { AUTH_TYPE_LABEL_BY_TYPE } from '../constants'
import { ActionsApp, App } from '../types'

import css from './ActionsPlatformAppsTableRow.less'

type Props = {
    app: Pick<App, 'icon' | 'name'> | undefined
    actionsApp: Pick<ActionsApp, 'id' | 'auth_type'>
    onClick: () => void
}

const ActionsPlatformAppsTableRow = ({ app, actionsApp, onClick }: Props) => {
    return (
        <TableBodyRow onClick={onClick}>
            <BodyCell>
                {app ? (
                    <img
                        src={app.icon}
                        alt={app.name}
                        className={css.icon}
                        title={app.name}
                    />
                ) : (
                    <i
                        className={classnames(
                            'material-icons',
                            css.missingAppIcon,
                        )}
                    >
                        help_outline
                    </i>
                )}
                <span className={css.name}>{app?.name || actionsApp.id}</span>
            </BodyCell>
            <BodyCell size="smallest" justifyContent="right">
                {AUTH_TYPE_LABEL_BY_TYPE[actionsApp.auth_type]}
            </BodyCell>
        </TableBodyRow>
    )
}

export default ActionsPlatformAppsTableRow
