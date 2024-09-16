import React from 'react'

import css from './PlaygroundActions.less'
import {PlaygroundAction} from './types'
import {PlaygroundActionsItem} from './PlaygroundActionsItem'

type Props = {
    actions: PlaygroundAction[]
    title?: string
}

export const PlaygroundActions = ({actions, title}: Props) => {
    return (
        <div className={css.container}>
            {title ? <span className={css.title}>{title}</span> : null}
            <ul className={css.list}>
                {actions.map((action) => (
                    <li key={action.id}>
                        <PlaygroundActionsItem action={action} />
                    </li>
                ))}
            </ul>
        </div>
    )
}
