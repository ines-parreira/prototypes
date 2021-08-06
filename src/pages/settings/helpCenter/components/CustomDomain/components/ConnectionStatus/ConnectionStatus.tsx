import React from 'react'
import classNames from 'classnames'
import _capitalize from 'lodash/capitalize'

import Tooltip from '../../../../../../common/components/Tooltip'
import Loader from '../../../../../../common/components/Loader/Loader'

import css from './ConnectionStatus.less'

export type ConnectionStatusProps = {
    className?: string
    label: string
    status: 'active' | 'unknown' | 'pending'
    tooltip?: string
}

// TODO: (Maybe) Move this to shared folder
// TODO: Add Storybook file
export const ConnectionStatus = ({
    className = '',
    label,
    status,
    tooltip,
}: ConnectionStatusProps) => {
    const $ref = React.createRef<HTMLDivElement>()
    let icon = 'wifi_off'

    if (status === 'active') {
        icon = 'wifi'
    }

    const content =
        status === 'pending' ? (
            <div
                className={classNames(css.container, className)}
                data-testid="connection-status"
            >
                <span data-testid="icon-loading">
                    <Loader minHeight="16px" size="16px" />
                </span>
                <span ref={$ref}>{label}</span>
            </div>
        ) : (
            <div
                className={classNames(css.container, className)}
                data-testid="connection-status"
            >
                <span
                    data-testid={`icon-${icon}`}
                    className={classNames(
                        {
                            [css.connected]: status === 'active',
                            [css.disconnected]: status === 'unknown',
                        },
                        'material-icons'
                    )}
                >
                    {icon}
                </span>
                <span ref={$ref}>{label}</span>
            </div>
        )

    return (
        <>
            {content}
            {tooltip && (
                <Tooltip
                    target={$ref}
                    placement="top-start"
                    style={{maxWidth: 190}}
                >
                    {_capitalize(tooltip)}
                </Tooltip>
            )}
        </>
    )
}
