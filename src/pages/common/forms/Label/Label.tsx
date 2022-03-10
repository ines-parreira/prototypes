import React, {LabelHTMLAttributes, ReactNode} from 'react'
import classnames from 'classnames'

import css from './Label.less'

type Props = {
    children?: ReactNode
    isDisabled?: boolean
    isRequired?: boolean
} & LabelHTMLAttributes<HTMLLabelElement>

const Label = ({
    children,
    className,
    htmlFor,
    isDisabled = false,
    isRequired = false,
    ...props
}: Props) => (
    <label
        className={classnames(
            css.label,
            {
                [css.isDisabled]: isDisabled,
            },
            className
        )}
        htmlFor={htmlFor}
        {...props}
    >
        {children}
        {isRequired && (
            <abbr className={css.abbr} title="required" aria-label="required">
                *
            </abbr>
        )}
    </label>
)

export default Label
