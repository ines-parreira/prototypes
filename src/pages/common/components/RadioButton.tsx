import React, {
    forwardRef,
    InputHTMLAttributes,
    Ref,
    useImperativeHandle,
    useRef,
} from 'react'
import classnames from 'classnames'

import {RadioFieldOption} from '../forms/RadioFieldSet'

import css from './RadioButton.less'

type Props = RadioFieldOption & {
    className?: string
    isSelected?: boolean
    isDisabled?: boolean
    onChange?: (value: string) => void
} & Omit<
        InputHTMLAttributes<HTMLInputElement>,
        'checked' | 'label' | 'disabled' | 'type' | 'onChange'
    >

function RadioButton(
    {
        caption,
        className,
        label,
        isSelected = false,
        isDisabled = false,
        value,
        onChange,
        ...props
    }: Props,
    forwardedRef: Ref<HTMLInputElement> | null | undefined
) {
    const ref = useRef<HTMLInputElement>(null)
    useImperativeHandle(forwardedRef, () => ref.current!)

    return (
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
                    className={css.input}
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => onChange?.(value)}
                    ref={ref}
                    {...props}
                />
                {label}
            </label>
            {!!caption && <div className={css.caption}>{caption}</div>}
        </div>
    )
}

export default forwardRef(RadioButton)
