import React from 'react'
import classNames from 'classnames'

import Tooltip from '../../../../../../common/components/Tooltip'

import css from '../../TableActions.less'

export type ActionSchema = {
    icon: string
    name: string
    tooltip?: {
        content: string | React.ReactNode
        target: string
    }
}

type ActionProps = ActionSchema & {
    onClick: (ev: React.MouseEvent<HTMLSpanElement>, name: string) => void
}

export const Action = ({
    icon,
    name,
    tooltip,
    onClick,
}: ActionProps): JSX.Element => {
    return (
        <>
            <span
                id={tooltip?.target}
                data-testid={name}
                className={classNames(css.action, 'material-icons')}
                onClick={(ev) => onClick(ev, name)}
            >
                {icon}
            </span>
            {tooltip && (
                <Tooltip placement="top-end" target={tooltip.target}>
                    {tooltip.content}
                </Tooltip>
            )}
        </>
    )
}
