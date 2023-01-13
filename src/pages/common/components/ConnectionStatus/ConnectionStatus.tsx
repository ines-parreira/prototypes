import React, {createRef} from 'react'
import classNames from 'classnames'
import _capitalize from 'lodash/capitalize'

import Tooltip from '../Tooltip'

import css from './ConnectionStatus.less'

export type ConnectionStatusProps = {
    className?: string
    label: string
    status: 'active' | 'unknown' | 'pending'
    tooltip?: string
}

// TODO: Add Storybook file
export const ConnectionStatus = ({
    className = '',
    label,
    status,
    tooltip,
}: ConnectionStatusProps): JSX.Element => {
    const $ref = createRef<HTMLDivElement>()
    const icon = status === 'active' ? 'wifi' : 'error_outline'

    const content =
        status === 'pending' ? (
            <div
                className={classNames(css.container, className)}
                data-testid="connection-status"
            >
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
                    style={{maxWidth: 190, textAlign: 'left'}}
                >
                    {_capitalize(tooltip)}
                </Tooltip>
            )}
        </>
    )
}
