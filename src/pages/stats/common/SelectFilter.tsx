import classnames from 'classnames'
import _capitalize from 'lodash/capitalize'
import _union from 'lodash/union'
import _without from 'lodash/without'
import _xor from 'lodash/xor'
import React, {
    useMemo,
    ComponentProps,
    ComponentType,
    useState,
    useEffect,
    useCallback,
} from 'react'
import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Input,
    Label,
} from 'reactstrap'

import css from './SelectFilter.less'

type Group = {
    label: string
    value: string
    itemValues: string[]
}

type Item = {
    label?: string
    value?: string
}

type Props = {
    className?: string
    dropdownMenu?: ComponentType<ComponentProps<typeof DropdownMenu>>
    groupLabel?: string
    groups?: Group[]
    groupValue?: string[]
    isDisabled?: boolean
    itemLabel?: string
    items: Item[]
    multiple?: boolean
    onChange: (value: string[]) => void
    onGroupChange?: (value: string[]) => void
    onSearch?: (query: string) => void
    plural?: string
    required?: boolean
    singular?: string
    value: string[]
}

export default function SelectFilter({
    className,
    dropdownMenu: DropdownMenuComponent = (
        props: ComponentProps<typeof DropdownMenu>
    ) => <DropdownMenu {...props} className={css.dropdown} />,
    groupLabel,
    groups,
    groupValue,
    isDisabled = false,
    itemLabel,
    items = [],
    multiple = true,
    onChange,
    onGroupChange,
    onSearch,
    plural = 'items',
    required = false,
    singular = 'item',
    value,
}: Props) {
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (onSearch) {
            onSearch(search)
        }
    }, [onSearch, search])

    const hasSelection = useMemo(() => !!value.length, [value])
    const toggleLabel = useMemo(() => {
        if (multiple) {
            return hasSelection
                ? `${value.length} ${value.length > 1 ? plural : singular}`
                : `All ${plural}`
        }
        const selectedItem = items.find((item) => item.value === value[0])

        return selectedItem ? selectedItem.label : _capitalize(singular)
    }, [hasSelection, multiple, plural, singular, value])
    const filteredItems = useMemo(() => {
        if (!search) {
            return items
        }
        return items.filter(
            (item) =>
                item.label &&
                item.label.toLowerCase().includes(search.toLowerCase())
        )
    }, [items, search])
    const filteredGroups = useMemo(() => {
        if (!search || !groups) {
            return groups
        }
        const filteredItemValues = filteredItems.map((item) => item.value)

        return groups.filter(
            (group) =>
                (group.label &&
                    group.label.toLowerCase().includes(search.toLowerCase())) ||
                group.itemValues.some((itemValue) =>
                    filteredItemValues.includes(itemValue)
                )
        )
    }, [groups, search, filteredItems])

    const handleOptionClick = useCallback(
        (optionValue: string) => {
            if (
                isDisabled ||
                (value.length === 1 && value[0] === optionValue && required)
            ) {
                return
            }
            const nextValue = _xor(value, [optionValue])
            onChange(nextValue)

            if (groupValue?.length && onGroupChange) {
                groupValue.map((v) => {
                    const group = groups?.find((group) => group.value === v)

                    if (
                        group &&
                        !group.itemValues.some((itemValue) =>
                            nextValue.includes(itemValue)
                        )
                    ) {
                        onGroupChange(_without(groupValue, v))
                    }
                })
            }
        },
        [isDisabled, onChange, required, value, groupValue, onGroupChange]
    )
    const handleGroupOptionClick = useCallback(
        (optionValue: string) => {
            const currentGroup = groups?.find(
                (group) => group.value === optionValue
            )

            if (isDisabled || !groupValue || !onGroupChange || !currentGroup) {
                return
            }
            const nextValue = _xor(groupValue, [optionValue])
            if (nextValue.length > groupValue.length) {
                onChange(_union(value, currentGroup.itemValues))
            } else {
                onChange(_without(value, ...currentGroup.itemValues))
            }
            onGroupChange(nextValue)
        },
        [isDisabled, groupValue, onGroupChange, onChange]
    )
    const handleIndeterminate = useCallback(
        ({itemValues, value: currentGroupValue}: Group) => (
            el: HTMLInputElement
        ) => {
            if (!el || !groupValue) {
                return
            }
            el.indeterminate =
                groupValue.includes(currentGroupValue) &&
                itemValues.some((itemValue) => value.includes(itemValue)) &&
                !itemValues.every((itemValue) => value.includes(itemValue))
        },
        [value, groupValue]
    )

    return (
        <UncontrolledDropdown disabled={isDisabled} className={className}>
            <DropdownToggle
                caret
                className="mr-2"
                color="secondary"
                type="button"
                disabled={isDisabled}
            >
                <span>{toggleLabel}</span>
            </DropdownToggle>
            <DropdownMenuComponent right>
                <DropdownItem
                    header
                    className={classnames(
                        'dropdown-item-input',
                        css.dropdownItemInput
                    )}
                >
                    <Input
                        autoFocus
                        className="mb-2"
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={`Search ${plural}...`}
                        value={search}
                    />
                </DropdownItem>
                <div className={css.content}>
                    <div className={css.items}>
                        {groupLabel && !!filteredGroups?.length && (
                            <DropdownItem header className={css.header}>
                                {groupLabel}
                            </DropdownItem>
                        )}
                        {!!filteredGroups?.length &&
                            filteredGroups.map((group) => (
                                <DropdownItem
                                    key={group.value}
                                    tag={(props) => <Label {...props} check />}
                                    toggle={false}
                                    className={css.item}
                                >
                                    <input
                                        checked={
                                            groupValue?.includes(group.value) &&
                                            group.itemValues.every(
                                                (itemValue) =>
                                                    value.includes(itemValue)
                                            )
                                        }
                                        className={classnames(
                                            'mr-2',
                                            css.checkbox
                                        )}
                                        onChange={() =>
                                            handleGroupOptionClick(group.value)
                                        }
                                        ref={handleIndeterminate(group)}
                                        type="checkbox"
                                    />
                                    {` ${group.label}`}
                                </DropdownItem>
                            ))}
                    </div>
                    <div className={css.items}>
                        {itemLabel && (
                            <DropdownItem header className={css.header}>
                                {itemLabel}
                            </DropdownItem>
                        )}
                        {filteredItems.length === 0 ? (
                            <DropdownItem header>
                                Could not find any {singular}
                            </DropdownItem>
                        ) : (
                            filteredItems.map((item) => (
                                <DropdownItem
                                    key={item.value}
                                    tag={(props) => <Label {...props} check />}
                                    toggle={false}
                                    className={css.item}
                                >
                                    <input
                                        checked={
                                            !!item.value &&
                                            value.includes(item.value)
                                        }
                                        className={classnames(
                                            'mr-2',
                                            css.checkbox
                                        )}
                                        onChange={() => {
                                            if (item.value) {
                                                handleOptionClick(item.value)
                                            }
                                        }}
                                        type="checkbox"
                                    />
                                    {` ${item.label || ''}`}
                                </DropdownItem>
                            ))
                        )}
                    </div>
                </div>
                {hasSelection && !required && (
                    <>
                        <DropdownItem divider />
                        <DropdownItem
                            onClick={() => {
                                if (isDisabled) {
                                    return
                                }

                                onChange([])
                            }}
                            type="button"
                        >
                            <span className="text-warning">{`Deselect ${
                                value.length > 1 ? 'all' : ''
                            }`}</span>
                        </DropdownItem>
                    </>
                )}
            </DropdownMenuComponent>
        </UncontrolledDropdown>
    )
}
