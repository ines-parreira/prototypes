import React from 'react'
import classNames from 'classnames'

import Tooltip from '../../../../../../common/components/Tooltip'

import css from '../../TableActions.less'

export type ActionSchema = {
    icon: string
    name: string
    tooltip?: string | React.ReactNode
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
    const $ref = React.createRef<HTMLSpanElement>()

    return (
        <>
            <span
                ref={$ref}
                data-testid={name}
                className={classNames(css.action, 'material-icons')}
                onClick={(ev) => onClick(ev, name)}
            >
                {icon}
            </span>
            {tooltip && (
                <Tooltip placement="top-end" target={$ref}>
                    {tooltip}
                </Tooltip>
            )}
        </>
    )
}
