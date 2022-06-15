import React from 'react'
import classNames from 'classnames'

import Tooltip from '../../../../../../common/components/Tooltip'

import css from '../../TableActions.less'

export type ActionSchema<TName extends string = string> = {
    icon: string
    name: TName
    tooltip?: {
        content: string | React.ReactNode
        target: string
    }
    disabled?: boolean
}

type ActionProps<TName extends string> = ActionSchema<TName> & {
    onClick: (ev: React.MouseEvent<HTMLSpanElement>, name: TName) => void
}

export function Action<TName extends string>({
    icon,
    name,
    tooltip,
    disabled,
    onClick,
}: ActionProps<TName>): JSX.Element {
    return (
        <>
            <button
                id={tooltip?.target}
                data-testid={name}
                className={classNames(css.action, 'material-icons')}
                disabled={disabled}
                onClick={(ev) => onClick(ev, name)}
            >
                {icon}
            </button>
            {tooltip && (
                <Tooltip placement="top-end" target={tooltip.target}>
                    {tooltip.content}
                </Tooltip>
            )}
        </>
    )
}
