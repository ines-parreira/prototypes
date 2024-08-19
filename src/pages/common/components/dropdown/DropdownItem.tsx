import React, {
    useContext,
    useMemo,
    useCallback,
    ReactNode,
    createElement,
    HTMLAttributes,
    forwardRef,
    useImperativeHandle,
    ForwardedRef,
    KeyboardEvent,
    useRef,
} from 'react'
import classnames from 'classnames'
import _isString from 'lodash/isString'
import _isFunction from 'lodash/isFunction'

import CheckBox from 'pages/common/forms/CheckBox'
import useEffectOnce from 'hooks/useEffectOnce'

import {DropdownContext} from './Dropdown'

import css from './DropdownItem.less'

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
}

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
        onKeyDown,
        ...rest
    }: Props<T> & Omit<HTMLAttributes<HTMLOrSVGElement>, 'onClick'>,
    ref: ForwardedRef<HTMLElement>
) => {
    const itemRef = useRef<HTMLElement>(null)
    useImperativeHandle(ref, () => itemRef.current!)

    const dropdownContext = useContext(DropdownContext)

    if (!dropdownContext) {
        throw new Error(
            'DropdownItem must be used within a DropdownContext.Provider'
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
        [option.label, query]
    )

    const Tag = useMemo(
        () =>
            forwardRef(({children, ...props}: HTMLAttributes<any>, ref) =>
                createElement(tag, {...props, ref}, children)
            ),
        [tag]
    )

    const isSelected = useMemo(
        () =>
            !!(Array.isArray(currentValue)
                ? (currentValue as any[]).includes(option.value)
                : currentValue === option.value),
        [currentValue, option]
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
        [onClick, onToggle, isDisabled, shouldCloseOnSelect]
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
        [onKeyDown, isDisabled, onClick, shouldCloseOnSelect, onToggle]
    )

    const label = useMemo(
        () =>
            children
                ? _isString(children)
                    ? getHighlightedLabel(children)
                    : _isFunction(children)
                    ? (children(getHighlightedLabel(option.label)) as ReactNode)
                    : children
                : getHighlightedLabel(option.label),
        [children, option, getHighlightedLabel]
    )

    return isContainingQuery ? (
        <Tag
            className={classnames(css.item, className, {
                [css.disabled]: isDisabled,
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
            {isMultiple && !hasSubItems && (
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
