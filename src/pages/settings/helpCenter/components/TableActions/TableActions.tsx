import React from 'react'

import {ActionSchema, Action} from './components/Action'

import css from './TableActions.less'

type Props = {
    actions: ActionSchema[]
    onClick: (ev: React.MouseEvent<HTMLSpanElement>, name: string) => void
}

export const TableActions = ({actions, onClick}: Props): JSX.Element => {
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
