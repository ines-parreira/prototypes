import React, {ReactNode, useContext} from 'react'
import classnames from 'classnames'

import {EditionContext} from 'providers/infobar/EditionContext'
import css from './Field.less'

type Props = {
    children: ReactNode
    label?: ReactNode
    noBold?: boolean
}

export function StaticField({children, label, noBold = false}: Props) {
    const {isEditing} = useContext(EditionContext)
    return (
        <div className={classnames(css.widgetField, css.staticWidgetField)}>
            {label ? (
                <span
                    className={classnames(css.widgetFieldLabel, {
                        [css.disabled]: isEditing,
                    })}
                >
                    {label}:{' '}
                </span>
            ) : null}
            <span
                className={classnames(css.widgetFieldValue, {
                    [css.disabled]: isEditing,
                    [css.noBold]: noBold,
                })}
            >
                {children}
            </span>
        </div>
    )
}
