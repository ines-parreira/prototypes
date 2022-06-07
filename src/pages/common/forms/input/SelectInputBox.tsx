import classnames from 'classnames'
import React, {
    createContext,
    FocusEvent,
    ForwardedRef,
    forwardRef,
    HTMLAttributes,
    ReactNode,
    useImperativeHandle,
    useState,
    useContext,
    useCallback,
    useMemo,
    useRef,
    RefObject,
} from 'react'
import {useEffectOnce, useKey, useUpdateEffect} from 'react-use'

import {
    GroupContext,
    GroupPositionContext,
} from 'pages/common/components/layout/Group'

import {InputGroupContext} from './InputGroup'
import css from './SelectInputBox.less'

type Props = {
    autoFocus?: boolean
    floating?: RefObject<HTMLElement | null>
    hasError?: boolean
    isDisabled?: boolean
    label?: string | string[] | null
    onToggle?: (nextValue: boolean) => void
    placeholder?: string
    prefix?: ReactNode
    suffix?: ReactNode
} & Omit<HTMLAttributes<HTMLDivElement>, 'prefix'>

type SelectInputBoxContextState = {
    onBlur: (event?: FocusEvent) => void
}

export const SelectInputBoxContext =
    createContext<SelectInputBoxContextState | null>(null)

const SelectInputBox = forwardRef(
    (
        {
            autoFocus,
            children,
            className,
            floating,
            hasError,
            isDisabled,
            label,
            onToggle,
            placeholder,
            prefix,
            suffix,
        }: Props,
        ref: ForwardedRef<HTMLDivElement>
    ) => {
        const inputElement = useRef<HTMLDivElement>(null)
        useImperativeHandle(ref, () => inputElement.current!)
        const appendPosition = useContext(GroupPositionContext) || ''
        const groupContext = useContext(GroupContext)
        const isDisabledMemoized = useMemo(
            () => groupContext?.isDisabled || isDisabled,
            [groupContext?.isDisabled, isDisabled]
        )
        const inputGroupContext = useContext(InputGroupContext)
        const isPlaceholder = useMemo(
            () => !label || label.length === 0,
            [label]
        )
        const labelMemoized = useMemo(
            () =>
                isPlaceholder
                    ? placeholder
                    : Array.isArray(label)
                    ? label.join(', ')
                    : label,
            [isPlaceholder, label, placeholder]
        )
        const [isFocused, setIsFocused] = useState(false)

        const handleAffixClick = useCallback(() => {
            inputElement.current?.focus()
        }, [])

        const handleFocus = useCallback(() => {
            if (isDisabledMemoized) {
                return
            }
            if (inputGroupContext) {
                inputGroupContext.setIsFocused(true)
            }
            setIsFocused(true)
        }, [inputGroupContext, isDisabledMemoized])

        const handleBlur = useCallback(
            (event?: FocusEvent) => {
                if (
                    event &&
                    (inputElement.current?.contains(
                        event.relatedTarget as Node
                    ) ||
                        floating?.current?.contains(event.target as Node))
                ) {
                    return
                }
                if (inputGroupContext) {
                    inputGroupContext.setIsFocused(false)
                }
                setIsFocused(false)
            },
            [floating, inputGroupContext]
        )

        useEffectOnce(() => {
            if (autoFocus && !isDisabledMemoized) {
                inputElement.current?.focus()
            }
        })

        useUpdateEffect(() => {
            if (onToggle) {
                onToggle(isFocused)
            }
        }, [isFocused, onToggle])

        useKey(
            'Escape',
            () => {
                const currentElement = inputElement.current

                if (!currentElement) {
                    return
                }
                if (document.activeElement !== currentElement) {
                    currentElement.focus()
                }
                currentElement.blur()
            },
            undefined,
            []
        )

        const contextValue = useMemo<SelectInputBoxContextState>(
            () => ({
                onBlur: handleBlur,
            }),
            [handleBlur]
        )

        return (
            <SelectInputBoxContext.Provider value={contextValue}>
                <div
                    className={classnames(css.wrapper, className)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    ref={inputElement}
                    role="listbox"
                    tabIndex={isDisabledMemoized ? -1 : 0}
                >
                    <div
                        className={classnames(
                            css.inputWrapper,
                            css[appendPosition],
                            {
                                [css.hasError]: hasError,
                                [css.isDisabled]: isDisabledMemoized,
                                [css.isFocused]: isFocused,
                                [css.isNested]: !!inputGroupContext,
                            }
                        )}
                    >
                        {prefix && (
                            <span
                                className={classnames(css.affix, css.prefix)}
                                onClick={handleAffixClick}
                            >
                                {prefix}
                            </span>
                        )}

                        <div
                            className={classnames(css.input, {
                                [css.isGreyed]:
                                    isDisabledMemoized || isPlaceholder,
                            })}
                        >
                            {labelMemoized}
                        </div>

                        {suffix && (
                            <span
                                className={classnames(css.affix, css.suffix)}
                                onClick={handleAffixClick}
                            >
                                {suffix}
                            </span>
                        )}

                        <i
                            className={classnames(
                                css.affix,
                                css.suffix,
                                css.toggle,
                                'material-icons'
                            )}
                            onClick={handleAffixClick}
                        >
                            arrow_drop_down
                        </i>
                    </div>
                    {children}
                </div>
            </SelectInputBoxContext.Provider>
        )
    }
)

export default SelectInputBox
