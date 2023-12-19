import React, {
    ForwardedRef,
    forwardRef,
    InputHTMLAttributes,
    useImperativeHandle,
    useRef,
} from 'react'

import Caption from '../forms/Caption/Caption'
import Label from '../forms/Label/Label'
import {RadioFieldOption} from '../forms/RadioFieldSet'

import css from './RadioButton.less'

type Props = RadioFieldOption & {
    className?: string
    isSelected?: boolean
    isDisabled?: boolean
    darkenCaption?: boolean
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
        id,
        darkenCaption = false,
        ...props
    }: Props,
    forwardedRef: ForwardedRef<HTMLInputElement>
) {
    const ref = useRef<HTMLInputElement>(null)
    useImperativeHandle(forwardedRef, () => ref.current!)

    return (
        <div className={className}>
            <Label
                htmlFor={id ?? value}
                isDisabled={isDisabled}
                className={css.label}
            >
                <input
                    type="radio"
                    id={id ?? value}
                    className={css.input}
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => onChange?.(value)}
                    ref={ref}
                    {...props}
                />
                {label}
            </Label>
            {!!caption && (
                <Caption className={css.caption} darken={darkenCaption}>
                    {caption}
                </Caption>
            )}
        </div>
    )
}

export default forwardRef<HTMLInputElement, Props>(RadioButton)
