import classnames from 'classnames'
import React, {ReactNode, useContext} from 'react'

import {EditionContext} from 'providers/infobar/EditionContext'

import css from './CustomStaticField.less'

type Props = {
    children: ReactNode
    label?: ReactNode
    noBold?: boolean
}

export function CustomStaticField({children, label, noBold = false}: Props) {
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
