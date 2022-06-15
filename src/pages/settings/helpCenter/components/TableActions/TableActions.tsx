import React from 'react'

import {ActionSchema, Action} from './components/Action'

import css from './TableActions.less'

type Props<TName extends string> = {
    actions: ActionSchema<TName>[]
    onClick: (ev: React.MouseEvent<HTMLSpanElement>, name: TName) => void
}

export function TableActions<TName extends string>({
    actions,
    onClick,
}: Props<TName>): JSX.Element {
    return (
        <div className={css['action-list']}>
            {actions.map((action) => (
                <Action
                    key={action.name}
                    icon={action.icon}
                    name={action.name}
                    tooltip={action.tooltip}
                    disabled={action.disabled}
                    onClick={onClick}
                />
            ))}
        </div>
    )
}
