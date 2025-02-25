import React, {
    ForwardedRef,
    forwardRef,
    InputHTMLAttributes,
    ReactNode,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react'

import classnames from 'classnames'

import { Label } from '@gorgias/merchant-ui-kit'

import useId from 'hooks/useId'

import Caption from './Caption/Caption'

import css from './CheckBox.less'

export type Props = {
    caption?: ReactNode
    children?: ReactNode
    className?: string
    isChecked?: boolean
    isDisabled?: boolean
    isRequired?: boolean
    isIndeterminate?: boolean
    labelClassName?: string
    name?: string
    error?: string | ReactNode
    onChange?: (nextValue: boolean) => void
    inputClassName?: string
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'checked' | 'disabled' | 'indeterminate' | 'name' | 'type' | 'onChange'
>

function CheckBox(
    {
        caption,
        children,
        className,
        isChecked,
        isDisabled = false,
        isRequired = false,
        isIndeterminate = false,
        labelClassName,
        name,
        error,
        onChange,
        inputClassName,
        ...props
    }: Props,
    ref: ForwardedRef<HTMLInputElement>,
) {
    const inputRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(ref, () => inputRef.current!, [inputRef])

    const id = useId()
    const labelId = name || 'checkbox-' + id

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = isIndeterminate
        }
    }, [isIndeterminate])

    return (
        <div className={className}>
            <Label
                className={classnames(css.label, labelClassName)}
                isDisabled={isDisabled}
                htmlFor={labelId}
                isRequired={isRequired}
            >
                <input
                    type="checkbox"
                    id={labelId}
                    name={labelId}
                    className={classnames(css.input, inputClassName)}
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => onChange?.(!isChecked)}
                    ref={inputRef}
                    {...props}
                />
                {children}
            </Label>
            {!!(caption || error) && (
                <Caption className={css.caption} error={error}>
                    {caption}
                </Caption>
            )}
        </div>
    )
}

export default forwardRef<HTMLInputElement, Props>(CheckBox)
