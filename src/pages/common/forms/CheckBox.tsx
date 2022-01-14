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
    caption?: string
    children: ReactNode
    className?: string
    isChecked: boolean
    isDisabled?: boolean
    isIndeterminate?: boolean
    name?: string
    onChange: (nextValue: boolean) => void
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'checked' | 'disabled' | 'indeterminate' | 'name' | 'type' | 'onChange'
>

const CheckBox = ({
    caption,
    children,
    className,
    isChecked,
    isDisabled = false,
    isIndeterminate = false,
    name,
    onChange,
    ...props
}: Props) => {
    const checkboxRef = useRef<HTMLInputElement>(null)
    const id = useMemo(() => name || _uniqueId('radio-field-'), [name])

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = isIndeterminate
        }
    }, [isIndeterminate])

    return (
        <div className={css.wrapper}>
            <label
                className={classnames(
                    css.label,
                    {
                        [css.disabled]: isDisabled,
                    },
                    className
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
                    onChange={() => onChange(!isChecked)}
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
