import { useMemo, useRef, useState } from 'react'

import classNames from 'classnames'

import {
    IconButton,
    SelectField,
    SelectFieldTriggerProps,
} from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'

import { SORT_OPTIONS } from './constants'
import { SortOption } from './types'

import css from './Sort.less'

const SelectTrigger = ({
    hasError: __hasError,
    isOpen: __isOpen,
    value: __value,
    setRef,
    ...buttonProps
}: SelectFieldTriggerProps) => (
    <IconButton
        {...buttonProps}
        ref={setRef}
        fillStyle="ghost"
        intent="secondary"
        isDisabled={buttonProps['disabled']}
        icon="swap_vert"
    />
)

type Props = {
    value: SortOption
    onChange: (value: SortOption) => void
}

export function Sort({ value, onChange }: Props) {
    const ref = useRef<HTMLButtonElement>(null)
    const [isSortOpen, setSortOpen] = useState(false)

    const hasCTDrawerUX = useFlag(FeatureFlagKey.CustomerTimelineDrawerUX)

    if (hasCTDrawerUX) {
        return (
            <>
                <IconButton
                    ref={ref}
                    aria-label="Sort"
                    fillStyle="ghost"
                    intent="secondary"
                    icon="swap_vert"
                    onClick={() => setSortOpen((isOpen) => !isOpen)}
                />
                <Dropdown
                    placement="bottom-end"
                    isOpen={isSortOpen}
                    onToggle={() => setSortOpen((isOpen) => !isOpen)}
                    target={ref}
                    value={value.label}
                >
                    <DropdownBody className={css.sortDropdownContainer}>
                        <ul className={css.sortList}>
                            {SORT_OPTIONS.map((option) => (
                                <DropdownCustomItem
                                    key={`${option.key}-${option.order}`}
                                    value={value}
                                    option={option}
                                    onChange={onChange}
                                    closeDropdown={() => setSortOpen(false)}
                                />
                            ))}
                        </ul>
                    </DropdownBody>
                </Dropdown>
            </>
        )
    }
    return (
        <SelectField
            trigger={SelectTrigger}
            dropdownAlignment="end"
            dropdownMaxWidth={400}
            selectedOption={value}
            onChange={onChange}
            options={SORT_OPTIONS}
            optionMapper={(option) => ({
                icon:
                    option.order === 'asc' ? 'arrow_upward' : 'arrow_downward',
                value: option.label,
            })}
        />
    )
}

function DropdownCustomItem({
    value,
    option,
    onChange,
    closeDropdown,
}: {
    value: SortOption
    option: SortOption
    onChange: (option: SortOption) => void
    closeDropdown: () => void
}) {
    const isSelected = useMemo(() => {
        return value.key === option.key && value.order === option.order
    }, [value, option])

    return (
        <li key={`${option.key}-${option.order}`} className={css.sortListItem}>
            <button
                onClick={() => {
                    onChange(option)
                    closeDropdown()
                }}
                className={classNames(css.sortItem, {
                    [css.selected]: isSelected,
                })}
            >
                <div className={css.sortItemContent}>
                    {option.order === 'asc' ? (
                        <span className={css.icon}>
                            <span className="material-icons">arrow_upward</span>
                        </span>
                    ) : (
                        <span className={css.icon}>
                            <span className="material-icons">
                                arrow_downward
                            </span>
                        </span>
                    )}
                    <span className={css.label}>{option.label}</span>
                </div>

                {isSelected && (
                    <span className={css.icon}>
                        <span className="material-icons">check</span>
                    </span>
                )}
            </button>
        </li>
    )
}
