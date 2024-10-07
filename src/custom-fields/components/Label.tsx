import React, {ForwardedRef, ReactNode, forwardRef} from 'react'
import classNames from 'classnames'

import css from './Label.less'

type Props = {
    className?: string
    label: string
    children: ReactNode
    isRequired?: boolean
}

function Label(
    {className, label, children, isRequired = false}: Props,
    ref: ForwardedRef<HTMLLabelElement>
) {
    return (
        <label ref={ref} className={classNames(css.wrapper, className)}>
            <div className={css.labelWrapper}>
                <span title={label} className={css.label}>
                    {label}:
                </span>
                {isRequired && <sup className={css.asterisk}>*</sup>}
            </div>
            {children}
        </label>
    )
}

export default forwardRef<HTMLLabelElement, Props>(Label)
