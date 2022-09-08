import React from 'react'

import useId from 'hooks/useId'

import Tooltip from 'pages/common/components/Tooltip'
import {AppOAuthPermission} from 'config/oauthPermissions'
import css from './AppPermission.less'

function makePermissionsLabel(verbs: string[]): string {
    const str = verbs.join(' & ') + ' access'
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function AppPermission(permission: AppOAuthPermission) {
    const tooltipId = 'app-permission-tooltip-' + useId()

    return (
        <div className={css.container}>
            <i className="material-icons">{permission.icon}</i>

            <div className={css.content}>
                <div className={css.name}>{permission.name}</div>
                <div className={css.permissions}>
                    {makePermissionsLabel(permission.verbs)}
                </div>
            </div>

            <span id={tooltipId}>
                <i className="material-icons">info_outline</i>
            </span>
            <Tooltip
                target={tooltipId}
                placement="right"
                innerClassName={css.tooltip}
            >
                {permission.description}
            </Tooltip>
        </div>
    )
}
