import React, {
    forwardRef,
    InputHTMLAttributes,
    ReactNode,
    Ref,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react'
import classnames from 'classnames'

import useId from 'hooks/useId'

import Caption from './Caption/Caption'
import Label from './Label/Label'
import css from './CheckBox.less'

export type Props = {
    caption?: ReactNode
    children?: ReactNode
    className?: string
    isChecked?: boolean
    isDisabled?: boolean
    isIndeterminate?: boolean
    labelClassName?: string
    name?: string
    onChange?: (nextValue: boolean) => void
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
        isIndeterminate = false,
        labelClassName,
        name,
        onChange,
        ...props
    }: Props,
    ref: Ref<HTMLInputElement> | null | undefined
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
            >
                <input
                    type="checkbox"
                    id={labelId}
                    name={labelId}
                    className={css.input}
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => onChange?.(!isChecked)}
                    ref={inputRef}
                    {...props}
                />
                {children}
            </Label>
            {!!caption && <Caption className={css.caption}>{caption}</Caption>}
        </div>
    )
}

export default forwardRef(CheckBox)
