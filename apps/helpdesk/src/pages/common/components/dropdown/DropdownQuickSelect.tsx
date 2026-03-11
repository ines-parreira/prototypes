import type { ForwardedRef, KeyboardEvent, ReactNode } from 'react'
import React, {
    forwardRef,
    useCallback,
    useContext,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react'

import { useEffectOnce } from '@repo/hooks'
import classnames from 'classnames'

import CheckBox from 'pages/common/forms/CheckBox'

import { DropdownContext } from './Dropdown'

import css from './DropdownQuickSelect.less'

export const SELECT_ALL_LABEL = 'Select all'
export const DESELECT_ALL_LABEL = 'Deselect all'

type Props<T extends boolean | number | string> = {
    addLabel?: ReactNode
    autoFocus?: boolean
    className?: string
    count?: number
    onRemoveAll: () => void
    onSelectAll: () => void
    removeLabel?: ReactNode
    shouldCloseOnSelect?: boolean
    values: T[]
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Menu />` or `<Select />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const DropdownQuickSelect = <T extends boolean | number | string>(
    {
        addLabel = SELECT_ALL_LABEL,
        autoFocus,
        className,
        count,
        onRemoveAll,
        onSelectAll,
        removeLabel = DESELECT_ALL_LABEL,
        shouldCloseOnSelect,
        values,
    }: Props<T>,
    ref: ForwardedRef<HTMLDivElement>,
) => {
    const itemRef = useRef<HTMLDivElement>(null)
    const dropdownContext = useContext(DropdownContext)

    useImperativeHandle(ref, () => itemRef.current!, [itemRef])

    useEffectOnce(() => {
        const currentItem = itemRef.current

        if (autoFocus && !currentItem?.previousElementSibling) {
            currentItem?.focus()
        }
    })

    if (!dropdownContext) {
        throw new Error(
            'DropdownQuickSelect must be used within a DropdownContext.Provider',
        )
    }
    const { value, onToggle } = dropdownContext

    const valueLength = useMemo(
        () => (Array.isArray(value) ? value.length : 0),
        [value],
    )
    const isSelected = useMemo(
        () => valueLength === values.length && valueLength > 0,
        [valueLength, values],
    )

    const isIndeterminate = useMemo(
        () => !isSelected && valueLength > 0,
        [isSelected, valueLength],
    )

    const handleClick = useCallback(() => {
        if (isSelected || isIndeterminate) {
            onRemoveAll()
        } else {
            onSelectAll()
        }
        if (shouldCloseOnSelect) {
            onToggle(false)
        }
    }, [
        isIndeterminate,
        isSelected,
        onRemoveAll,
        onSelectAll,
        onToggle,
        shouldCloseOnSelect,
    ])

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleClick()
            }
        },
        [handleClick],
    )

    return (
        <div
            aria-selected={isSelected}
            className={classnames(css.wrapper, className)}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            ref={itemRef}
            role="option"
            tabIndex={0}
        >
            <CheckBox
                className={css.checkbox}
                isChecked={isSelected}
                isIndeterminate={isIndeterminate}
                tabIndex={-1}
            />
            <span className={css.label}>
                {isSelected || isIndeterminate ? removeLabel : addLabel}
            </span>

            {count != null && (
                <span
                    className={classnames(css.count, {
                        [css.isHighlighted]: isIndeterminate || isSelected,
                    })}
                >
                    {isIndeterminate ? valueLength : count}
                </span>
            )}
        </div>
    )
}

export default forwardRef(DropdownQuickSelect)
