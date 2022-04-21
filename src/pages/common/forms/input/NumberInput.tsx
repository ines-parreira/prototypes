import classnames from 'classnames'
import React, {
    forwardRef,
    ForwardedRef,
    InputHTMLAttributes,
    ReactNode,
    useCallback,
    useContext,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react'
import {useEvent} from 'react-use'

import IconButton from 'pages/common/components/button/IconButton'
import Group, {
    GroupContext,
    GroupPositionContext,
} from 'pages/common/components/layout/Group'

import {InputGroupContext} from './InputGroup'

import css from './NumberInput.less'

type Props = {
    className?: string
    hasError?: boolean
    hasControls?: boolean
    isDisabled?: boolean
    isRequired?: boolean
    max?: number
    min?: number
    onChange: (nextValue?: number) => void
    prefix?: ReactNode
    suffix?: ReactNode
    value?: number
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | 'disabled'
    | 'required'
    | 'type'
    | 'prefix'
    | 'onChange'
    | 'max'
    | 'min'
    | 'value'
>

function NumberInput(
    {
        autoFocus,
        className,
        hasError,
        isDisabled,
        isRequired,
        hasControls = true,
        max = Infinity,
        min = Number.NEGATIVE_INFINITY,
        onChange,
        prefix,
        suffix,
        value,
        ...other
    }: Props,
    ref: ForwardedRef<HTMLInputElement>
) {
    const appendPosition = useContext(GroupPositionContext) || ''
    const [inputElement, setInputElement] = useState<HTMLInputElement | null>(
        null
    )
    useImperativeHandle(ref, () => inputElement!)
    const groupContext = useContext(GroupContext)
    const inputGroupContext = useContext(InputGroupContext)
    const [isFocused, setIsFocused] = useState(!!autoFocus)

    const isDisabledMemoized = useMemo(
        () => groupContext?.isDisabled || isDisabled,
        [groupContext?.isDisabled, isDisabled]
    )

    const handleFocus = useCallback(() => {
        if (inputGroupContext) {
            inputGroupContext.setIsFocused(true)
        }
        setIsFocused(true)
    }, [inputGroupContext])

    const handleBlur = useCallback(() => {
        if (inputGroupContext) {
            inputGroupContext.setIsFocused(false)
        }
        setIsFocused(false)
    }, [inputGroupContext])

    useEvent('focus', handleFocus, inputElement)
    useEvent('blur', handleBlur, inputElement)

    const handleAffixClick = useCallback(() => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [inputElement])

    const handleArrowClick = useCallback(
        (direction: 'up' | 'down') => () => {
            if (!isFocused && inputElement) {
                inputElement.focus()
            }
            onChange(
                Math.max(
                    Math.min((value ?? 0) + (direction === 'up' ? 1 : -1), max),
                    min
                )
            )
        },
        [inputElement, isFocused, max, min, onChange, value]
    )

    return (
        <Group
            className={classnames(className, css.wrapper, css[appendPosition], {
                [css.hasError]: hasError,
                [css.isDisabled]: isDisabledMemoized,
                [css.isFocused]: isFocused,
                [css.isNested]: !!inputGroupContext,
            })}
        >
            {prefix && (
                <span className={css.prefix} onClick={handleAffixClick}>
                    {prefix}
                </span>
            )}
            <input
                autoFocus={autoFocus}
                className={classnames(css.input, {
                    [css.isAlignedRight]: !!suffix,
                    [css.isDisabled]: isDisabledMemoized,
                })}
                disabled={isDisabledMemoized}
                max={max}
                min={min}
                onChange={(e) => {
                    const parsedValue = Number(e.target.value)

                    onChange(isNaN(parsedValue) ? undefined : parsedValue)
                }}
                ref={(element) => setInputElement(element)}
                required={isRequired}
                type="number"
                value={value ?? ''}
                {...other}
            />
            {suffix && (
                <span className={css.suffix} onClick={handleAffixClick}>
                    {suffix}
                </span>
            )}
            {hasControls && (
                <Group
                    className={css.controls}
                    isDisabled={isDisabledMemoized}
                    orientation="vertical"
                >
                    <IconButton
                        className={css.button}
                        intent="secondary"
                        isDisabled={value != null && value >= max}
                        onClick={handleArrowClick('up')}
                        onMouseDown={(e) => e.preventDefault()}
                        type="button"
                        size="small"
                    >
                        arrow_drop_up
                    </IconButton>
                    <IconButton
                        className={css.button}
                        intent="secondary"
                        isDisabled={value != null && value <= min}
                        onClick={handleArrowClick('down')}
                        onMouseDown={(e) => e.preventDefault()}
                        type="button"
                        size="small"
                    >
                        arrow_drop_down
                    </IconButton>
                </Group>
            )}
        </Group>
    )
}

export default forwardRef(NumberInput)
