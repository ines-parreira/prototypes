import type { ForwardedRef, InputHTMLAttributes, KeyboardEvent } from 'react'
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react'

import { useDebouncedEffect } from '@repo/hooks'
import classnames from 'classnames'

import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'

import css from './Search.less'

type Props = {
    className?: string
    onChange?: (searchQuery: string) => void
    onKeyDown?: (event: KeyboardEvent, searchQuery: string) => void
    searchDebounceTime?: number
    textInputClassName?: string
    value?: string
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'onKeyDown' | 'value'
>

const Search = (
    {
        className,
        onChange,
        onKeyDown,
        placeholder = 'Search...',
        searchDebounceTime = 0,
        textInputClassName,
        type,
        value,
        ...rest
    }: Props,
    forwardedRef: ForwardedRef<HTMLInputElement>,
) => {
    const [internalValue, setInternalValue] = useState(value ?? '')
    const [previousValue, setPreviousValue] = useState(value ?? '')

    const ref = useRef<HTMLInputElement>(null)
    useImperativeHandle(forwardedRef, () => ref.current!)

    useEffect(() => {
        if (value !== undefined && previousValue !== value) {
            setInternalValue(value)
            setPreviousValue(value)
        }
    }, [previousValue, value])

    const handleKeyDown = (e: KeyboardEvent) => {
        onKeyDown?.(e, internalValue)
        if (e.key === 'Escape' && ref) {
            ref.current?.blur()
        }
    }

    useDebouncedEffect(
        () => {
            if (value !== internalValue) {
                onChange?.(internalValue)
            }
        },
        [internalValue],
        searchDebounceTime,
    )

    return (
        <div className={classnames(css.component, className)}>
            <TextInput
                ref={ref}
                type={type}
                className={classnames(css.input, textInputClassName)}
                value={internalValue}
                onChange={setInternalValue}
                prefix={<IconInput icon="search" />}
                placeholder={placeholder}
                {...rest}
                onKeyDown={handleKeyDown}
            />
        </div>
    )
}

export default forwardRef<HTMLInputElement, Props>(Search)
