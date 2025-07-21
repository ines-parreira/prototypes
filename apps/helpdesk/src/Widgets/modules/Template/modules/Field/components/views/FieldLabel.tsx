import React, { ComponentProps } from 'react'

import cs from 'classnames'

import css from './FieldLabel.less'

export default function FieldLabel({
    isDisabled = false,
    className,
    ...props
}: {
    isDisabled?: boolean
} & ComponentProps<'span'>) {
    return (
        <span
            className={cs(css.fieldLabel, className, {
                [css.isDisabled]: isDisabled,
            })}
            {...props}
        />
    )
}
