import React, {ReactNode} from 'react'
import classnames from 'classnames'

import css from './ColorPanel.less'

type Props = {
    accentColor?: string
    children?: ReactNode
}

export default function ColorPanel({children, accentColor}: Props) {
    return (
        <div
            className={classnames(css.wrapper)}
            style={
                accentColor
                    ? {
                          boxShadow: `inset 3px 0 0 ${accentColor}`,
                      }
                    : undefined
            }
        >
            {children}
        </div>
    )
}
