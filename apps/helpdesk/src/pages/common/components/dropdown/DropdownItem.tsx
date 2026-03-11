import type {
    ForwardedRef,
    HTMLAttributes,
    KeyboardEvent,
    ReactNode,
} from 'react'
import React, {
    createElement,
    forwardRef,
    useCallback,
    useContext,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react'

import { useEffectOnce } from '@repo/hooks'
import classnames from 'classnames'
import _isFunction from 'lodash/isFunction'
import _isString from 'lodash/isString'

import { DropdownContext } from 'pages/common/components/dropdown/Dropdown'
import css from 'pages/common/components/dropdown/DropdownItem.less'
import CheckBox from 'pages/common/forms/CheckBox'

export type Props<T extends boolean | number | string | null> = {
    autoFocus?: boolean
    children?: ReactNode | ((highlightedLabel: ReactNode) => ReactNode)
    className?: string
    onClick: (value: T) => void
    shouldCloseOnSelect?: boolean
    isDisabled?: boolean
    hasSubItems?: boolean
    tag?: keyof JSX.IntrinsicElements
    option: {
        label: string
        value: T
    }
    alwaysVisible?: boolean
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<MenuItem />` or `<Select />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
export const DropdownItem = <T extends boolean | number | string | null>(
    {
        autoFocus,
        children,
        className,
        onClick,
        shouldCloseOnSelect,
        hasSubItems = false,
        isDisabled,
        tag = 'li',
        option,
        alwaysVisible = false,
        onKeyDown,
        ...rest
    }: Props<T> &
        Omit<HTMLAttributes<HTMLOrSVGElement>, 'onClick' | 'children'>,
    ref: ForwardedRef<HTMLElement>,
) => {
    const itemRef = useRef<HTMLElement>(null)
    useImperativeHandle(ref, () => itemRef.current!, [itemRef])

    const dropdownContext = useContext(DropdownContext)

    if (!dropdownContext) {
        throw new Error(
            'DropdownItem must be used within a DropdownContext.Provider',
        )
    }

    const {
        isMultiple,
        value: currentValue,
        getHighlightedLabel,
        onToggle,
        query,
    } = dropdownContext

    const isContainingQuery = useMemo(
        () =>
            option.label
                .toString()
                .toLowerCase()
                .includes(query.toLocaleLowerCase()),
        [option.label, query],
    )

    const Tag = useMemo(
        () =>
            forwardRef(({ children, ...props }: HTMLAttributes<any>, ref) =>
                createElement(tag, { ...props, ref }, children),
            ),
        [tag],
    )

    const isSelected = useMemo(
        () =>
            !!(Array.isArray(currentValue)
                ? (currentValue as any[]).includes(option.value)
                : currentValue === option.value),
        [currentValue, option],
    )

    useEffectOnce(() => {
        const currentItem = itemRef.current
        if (autoFocus && !currentItem?.previousElementSibling) {
            currentItem?.focus()
        }
    })

    const handleClick = useCallback(
        (value: T) => {
            if (isDisabled) {
                return
            }
            onClick(value)
            if (shouldCloseOnSelect) {
                onToggle(false)
            }
        },
        [onClick, onToggle, isDisabled, shouldCloseOnSelect],
    )

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLOrSVGElement>, value: T) => {
            const currentItem = itemRef.current
            if (event.key === 'Enter' || event.key === ' ') {
                if (isDisabled) {
                    return
                }

                event.preventDefault()
                onClick(value)
                if (shouldCloseOnSelect) {
                    onToggle(false)
                }
            }

            if (onKeyDown) {
                onKeyDown(event)
                return
            }

            if (event.key === 'ArrowUp') {
                if (currentItem?.previousElementSibling) {
                    ;(
                        currentItem?.previousElementSibling as HTMLElement
                    ).focus()
                } else {
                    ;(
                        currentItem?.parentNode?.lastElementChild as HTMLElement
                    )?.focus()
                }
            } else if (event.key === 'ArrowDown') {
                if (currentItem?.nextElementSibling) {
                    ;(currentItem?.nextElementSibling as HTMLElement).focus()
                } else {
                    ;(
                        currentItem?.parentNode
                            ?.firstElementChild as HTMLElement
                    ).focus()
                }
            }
        },
        [onKeyDown, isDisabled, onClick, shouldCloseOnSelect, onToggle],
    )

    const label: ReactNode | string = useMemo(() => {
        if (children) {
            if (_isString(children)) {
                return getHighlightedLabel(children)
            }
            if (_isFunction(children)) {
                const highlighted = getHighlightedLabel(option.label)
                return children(highlighted)
            }
            return children
        }
        return getHighlightedLabel(option.label)
    }, [children, option, getHighlightedLabel])

    return alwaysVisible || isContainingQuery ? (
        <Tag
            className={classnames(css.item, className, {
                [css.disabled]: isDisabled,
                [css.selected]: isSelected,
            })}
            role="option"
            onClick={() => handleClick(option.value)}
            onKeyDown={(e: KeyboardEvent<HTMLOrSVGElement>) =>
                handleKeyDown(e, option.value)
            }
            ref={itemRef}
            tabIndex={0}
            {...rest}
        >
            {!!isMultiple && !hasSubItems && (
                <CheckBox
                    isChecked={isSelected}
                    className={css.checkbox}
                    tabIndex={-1}
                />
            )}

            {label}

            {!isMultiple && isSelected && !isDisabled && (
                <span className={classnames(css.icon, 'material-icons')}>
                    done
                </span>
            )}
        </Tag>
    ) : null
}

export default forwardRef(DropdownItem)
