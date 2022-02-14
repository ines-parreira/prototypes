import React, {
    forwardRef,
    InputHTMLAttributes,
    ReactNode,
    Ref,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react'
import classnames from 'classnames'
import _uniqueId from 'lodash/uniqueId'

import css from './CheckBox.less'

type Props = {
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

    const id = useMemo(() => name || _uniqueId('checkbox-'), [name])

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = isIndeterminate
        }
    }, [isIndeterminate])

    return (
        <div className={className}>
            <label
                className={classnames(
                    css.label,
                    {
                        [css.isDisabled]: isDisabled,
                        [css.hasCaption]: !!caption,
                    },
                    labelClassName
                )}
                htmlFor={id}
            >
                <input
                    type="checkbox"
                    id={id}
                    name={id}
                    className={css.input}
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => onChange?.(!isChecked)}
                    ref={inputRef}
                    {...props}
                />
                {children}
            </label>
            <div className={css.caption}>{caption}</div>
        </div>
    )
}

export default forwardRef(CheckBox)
