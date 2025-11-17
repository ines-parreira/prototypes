import type { ComponentProps } from 'react'
import React from 'react'

import cs from 'classnames'

import css from './FieldValue.less'

export default function FieldValue({
    isDisabled = false,
    isNotBold = false,
    canOverflow = false,
    className,
    ...props
}: {
    isDisabled?: boolean
    isNotBold?: boolean
    canOverflow?: boolean
} & ComponentProps<'span'>) {
    return (
        <span
            className={cs(css.fieldValue, className, {
                [css.isDisabled]: isDisabled,
                [css.isNotBold]: isNotBold,
                [css.overflow]: canOverflow,
            })}
            {...props}
        />
    )
}
