import React from 'react'

import css from './PlaygroundActions.less'
import {PlaygroundActionsItem} from './PlaygroundActionsItem'
import {PlaygroundAction} from './types'

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
