import React, {
    InputHTMLAttributes,
    ReactNode,
    useEffect,
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
    name?: string
    onChange?: (nextValue: boolean) => void
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'checked' | 'disabled' | 'indeterminate' | 'name' | 'type' | 'onChange'
>

const CheckBox = ({
    caption,
    children,
    className,
    isChecked = false,
    isDisabled = false,
    isIndeterminate = false,
    name,
    onChange,
    ...props
}: Props) => {
    const checkboxRef = useRef<HTMLInputElement>(null)
    const id = useMemo(() => name || _uniqueId('checkbox-'), [name])

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = isIndeterminate
        }
    }, [isIndeterminate])

    return (
        <div className={className}>
            <label
                className={classnames(css.label, {
                    [css.isDisabled]: isDisabled,
                    [css.hasCaption]: !!caption,
                })}
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
                    ref={checkboxRef}
                    {...props}
                />
                {children}
            </label>
            <div className={css.caption}>{caption}</div>
        </div>
    )
}

export default CheckBox
