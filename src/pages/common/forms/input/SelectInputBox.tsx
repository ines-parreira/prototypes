import React, {
    createContext,
    FocusEvent,
    ForwardedRef,
    forwardRef,
    HTMLAttributes,
    ReactNode,
    RefObject,
    useCallback,
    useContext,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'

import classnames from 'classnames'

import useEffectOnce from 'hooks/useEffectOnce'
import useUpdateEffect from 'hooks/useUpdateEffect'
import {
    GroupContext,
    GroupPositionContext,
} from 'pages/common/components/layout/Group'
import Caption from 'pages/common/forms/Caption/Caption'

import { InputGroupContext } from './InputGroup'

import css from './SelectInputBox.less'

type Props = {
    autoFocus?: boolean
    floating?: RefObject<HTMLElement | null>
    hasError?: boolean
    error?: string | ReactNode
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

const SelectInputBox = (
    {
        autoFocus,
        children,
        className,
        floating,
        hasError,
        error,
        isDisabled,
        label,
        onToggle,
        placeholder,
        prefix,
        suffix,
        id,
        ['aria-controls']: ariaControls, // TODO: make aria-controls and aria-expanded required to comply with role="combobox" requirements https://github.com/evcohen/eslint-plugin-jsx-a11y/tree/master/docs/rules/role-has-required-aria-props.md
        ['aria-expanded']: ariaExpanded,
        ['aria-labelledby']: ariaLabelledBy,
        ...props
    }: Props,
    ref: ForwardedRef<HTMLDivElement>,
) => {
    const captionId = `${id}-caption`

    const inputElement = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => inputElement.current!)
    const appendPosition = useContext(GroupPositionContext) || ''
    const groupContext = useContext(GroupContext)
    const isDisabledMemoized = useMemo(
        () => groupContext?.isDisabled || isDisabled,
        [groupContext?.isDisabled, isDisabled],
    )
    const inputGroupContext = useContext(InputGroupContext)
    const isPlaceholder = useMemo(() => !label || label.length === 0, [label])
    const labelMemoized = useMemo(
        () =>
            isPlaceholder
                ? placeholder
                : Array.isArray(label)
                  ? label.join(', ')
                  : label,
        [isPlaceholder, label, placeholder],
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
                (inputElement.current?.contains(event.relatedTarget as Node) ||
                    floating?.current?.contains(event.target as Node) ||
                    floating?.current?.contains(event.relatedTarget as Node))
            ) {
                return
            }
            if (inputGroupContext) {
                inputGroupContext.setIsFocused(false)
            }
            setIsFocused(false)
        },
        [floating, inputGroupContext],
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

    const contextValue = useMemo<SelectInputBoxContextState>(
        () => ({
            onBlur: handleBlur,
        }),
        [handleBlur],
    )

    return (
        <SelectInputBoxContext.Provider value={contextValue}>
            <div
                className={classnames(
                    css.wrapper,
                    { [css.leftMargin]: appendPosition === 'left' },
                    className,
                )}
                onFocus={handleFocus}
                onBlur={handleBlur}
                ref={inputElement}
                role="combobox"
                aria-controls={ariaControls}
                aria-expanded={ariaExpanded}
                aria-invalid={hasError ?? (!!error ? true : undefined)}
                aria-labelledby={ariaLabelledBy}
                tabIndex={isDisabledMemoized ? -1 : 0}
                id={id}
            >
                <div
                    className={classnames(
                        css.inputWrapper,
                        css[appendPosition],
                        {
                            [css.hasError]: hasError || error,
                            [css.isDisabled]: isDisabledMemoized,
                            [css.isFocused]: isFocused,
                            [css.isNested]: !!inputGroupContext,
                        },
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
                            [css.isGreyed]: isDisabledMemoized || isPlaceholder,
                        })}
                        {...props}
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
                            'material-icons',
                        )}
                        onClick={handleAffixClick}
                    >
                        arrow_drop_down
                    </i>
                </div>
                {children}
            </div>
            {!!error && <Caption id={captionId} error={error} />}
        </SelectInputBoxContext.Provider>
    )
}

export default forwardRef<HTMLDivElement, Props>(SelectInputBox)
