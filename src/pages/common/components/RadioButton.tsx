import React, {InputHTMLAttributes} from 'react'
import classnames from 'classnames'

import {RadioFieldOption} from '../forms/RadioFieldSet'

import css from './RadioButton.less'

type Props = RadioFieldOption & {
    className?: string
    isSelected?: boolean
    isDisabled?: boolean
    onChange?: (value?: string) => void
} & Omit<
        InputHTMLAttributes<HTMLInputElement>,
        'checked' | 'disabled' | 'type' | 'onChange'
    >

const RadioButton = ({
    caption,
    className,
    label,
    isSelected = false,
    isDisabled = false,
    value,
    onChange,
    ...props
}: Props) => (
    <div className={className}>
        <label
            htmlFor={value}
            className={classnames(css.label, {
                [css.disabledLabel]: isDisabled,
                [css.labelWithCaption]: !!caption,
            })}
        >
            <input
                type="radio"
                id={value}
                name={value}
                className={css.input}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => onChange?.(value)}
                {...props}
            />
            {label}
        </label>
        {!!caption && <div className={css.caption}>{caption}</div>}
    </div>
)

export default RadioButton
