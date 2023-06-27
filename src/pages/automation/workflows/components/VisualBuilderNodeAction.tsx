import React from 'react'
import classnames from 'classnames'

import css from './VisualBuilderNodeAction.less'

type VisualBuilderNodeActionProps = {
    text: string
    icon: string
    color: 'red' | 'orange' | 'blue' | 'teal'
}

export default function VisualBuilderNodeAction({
    text,
    icon,
    color,
}: VisualBuilderNodeActionProps) {
    return (
        <div className={classnames(css.visualBuilderNodeAction, css[color])}>
            <i className={classnames('material-icons', css.icon)}>{icon}</i>
            {text}
        </div>
    )
}
