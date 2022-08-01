import React, {
    useContext,
    useMemo,
    useCallback,
    useRef,
    ReactNode,
    createElement,
    HTMLAttributes,
    forwardRef,
} from 'react'
import classnames from 'classnames'
import _isString from 'lodash/isString'
import _isFunction from 'lodash/isFunction'
import {useEffectOnce} from 'react-use'

import CheckBox from 'pages/common/forms/CheckBox'

import {DropdownContext} from './Dropdown'
import css from './DropdownItem.less'

type Props<T extends boolean | number | string> = {
    autoFocus?: boolean
    children?: ReactNode | ((highlightedLabel: ReactNode) => ReactNode)
    className?: string
    onClick: (value: T) => void
    shouldCloseOnSelect?: boolean
    tag?: keyof JSX.IntrinsicElements
    option: {
        label: string
        value: T
    }
}

const DropdownItem = <T extends boolean | number | string>({
    autoFocus,
    children,
    className,
    onClick,
    shouldCloseOnSelect,
    tag = 'li',
    option,
    ...rest
}: Props<T> & Omit<HTMLAttributes<HTMLOrSVGElement>, 'onClick'>) => {
    const itemRef = useRef<HTMLElement | null>(null)

    const dropdownContext = useContext(DropdownContext)

    if (!dropdownContext) {
        throw new Error(
            'DropdownSearch must be used within a DropdownContext.Provider'
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
            onClick(value)
            if (shouldCloseOnSelect) {
                onToggle(false)
            }
        },
        [onClick, onToggle, shouldCloseOnSelect]
    )

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent, value: T) => {
            const currentItem = itemRef?.current

            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick(value)
                if (shouldCloseOnSelect) {
                    onToggle(false)
                }
            }
            if (event.key === 'ArrowUp') {
                if (currentItem?.previousElementSibling) {
                    ;(
                        currentItem?.previousElementSibling as HTMLElement
                    ).focus()
                }
            } else if (event.key === 'ArrowDown') {
                if (currentItem?.nextElementSibling) {
                    ;(currentItem?.nextElementSibling as HTMLElement).focus()
                }
            }
        },
        [onClick, shouldCloseOnSelect, onToggle]
    )

    const label = useMemo(
        () =>
            children
                ? _isString(children)
                    ? getHighlightedLabel(children)
                    : _isFunction(children)
                    ? children(getHighlightedLabel(option.label))
                    : children
                : getHighlightedLabel(option.label),
        [children, option, getHighlightedLabel]
    )

    return isContainingQuery ? (
        <Tag
            className={classnames(css.item, className)}
            role="option"
            onClick={() => handleClick(option.value)}
            onKeyDown={(e: React.KeyboardEvent) =>
                handleKeyDown(e, option.value)
            }
            ref={itemRef}
            tabIndex={0}
            {...rest}
        >
            {isMultiple && (
                <CheckBox
                    isChecked={isSelected}
                    className={css.checkbox}
                    tabIndex={-1}
                />
            )}
            {label}
            {!isMultiple && isSelected && (
                <span className={classnames(css.icon, 'material-icons')}>
                    done
                </span>
            )}
        </Tag>
    ) : null
}

export default DropdownItem
