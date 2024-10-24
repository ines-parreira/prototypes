import cs from 'classnames'
import React, {ComponentProps} from 'react'

import css from './FieldValue.less'

export default function FieldValue({
    isDisabled = false,
    isNotBold = false,
    className,
    ...props
}: {
    isDisabled?: boolean
    isNotBold?: boolean
} & ComponentProps<'span'>) {
    return (
        <span
            className={cs(css.fieldValue, className, {
                [css.isDisabled]: isDisabled,
                [css.isNotBold]: isNotBold,
            })}
            {...props}
        />
    )
}
