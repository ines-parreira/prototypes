import React, {createRef} from 'react'
import classNames from 'classnames'
import _capitalize from 'lodash/capitalize'
import {Tooltip} from '@gorgias/ui-kit'

import css from './ConnectionStatus.less'

type Props = {
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
}: Props) => {
    const $ref = createRef<HTMLDivElement>()
    const icon = status === 'active' ? 'wifi' : 'error_outline'

    return (
        <>
            {status === 'pending' ? (
                <div className={classNames(css.container, className)}>
                    <span ref={$ref}>{label}</span>
                </div>
            ) : (
                <div className={classNames(css.container, className)}>
                    <span
                        aria-label={`Icon for connection ${status}`}
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
            )}
            {tooltip && (
                <Tooltip
                    target={$ref}
                    placement="top-start"
                    innerProps={{
                        style: {maxWidth: 190, textAlign: 'left'},
                    }}
                >
                    {_capitalize(tooltip)}
                </Tooltip>
            )}
        </>
    )
}
