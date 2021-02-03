import classnames from 'classnames'
import _capitalize from 'lodash/capitalize'
import _union from 'lodash/union'
import _without from 'lodash/without'
import _xor from 'lodash/xor'
import React, {
    ComponentProps,
    ComponentType,
    createContext,
    ReactElement,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    Input,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Label,
    UncontrolledDropdown,
} from 'reactstrap'

import css from './SelectFilter.less'

enum CheckedStatus {
    Checked = 'checked',
    Unchecked = 'unchecked',
    Partial = 'partial',
}

interface ItemContext {
    handleChange: (itemId: string) => void
    isChecked: (label: string) => boolean
    isDisplayed: (label: string) => boolean
}

const SelectFilterItemContext = createContext<ItemContext>({
    handleChange: () => {
        throw new Error('no handleChange provided')
    },
    isChecked: () => {
        throw new Error('no isChecked provided')
    },
    isDisplayed: () => {
        throw new Error('no isDisplayed provided')
    },
})

type ItemProps = {
    label: string
    value: string
}

const Item = ({label, value}: ItemProps) => {
    const {handleChange, isChecked, isDisplayed} = useContext(
        SelectFilterItemContext
    )

    if (!isDisplayed(label)) {
        return null
    }

    return (
        <DropdownItem
            key={value}
            tag={(props) => <Label {...props} check />}
            toggle={false}
            className={css.item}
        >
            <input
                checked={isChecked(value)}
                className={classnames('mr-2', css.checkbox)}
                onChange={() => handleChange(value)}
                type="checkbox"
            />
            {` ${label}`}
        </DropdownItem>
    )
}

Item.displayName = 'SelectFilter.Item'

export type GroupProps = {
    items: string[]
    label: string
    value: string
}

interface GroupContext {
    getCheckedStatus: (group: Partial<GroupProps>) => CheckedStatus
    handleChange: (groupId: string, items: string[]) => void
    isChecked: (label: string) => boolean
    isDisplayed: (label: string, items: string[]) => boolean
}

const SelectFilterGroupContext = createContext<GroupContext>({
    getCheckedStatus: () => {
        throw new Error('no getCheckedStatus provided')
    },
    handleChange: () => {
        throw new Error('no handleChange provided')
    },
    isChecked: () => {
        throw new Error('no handleChange provided')
    },
    isDisplayed: () => {
        throw new Error('no isDisplayed provided')
    },
})

const Group = ({items, label, value}: GroupProps) => {
    const {getCheckedStatus, handleChange, isChecked, isDisplayed} = useContext(
        SelectFilterGroupContext
    )

    const handleIndeterminate = useCallback(
        (el: HTMLInputElement) => {
            if (!el) {
                return
            }
            el.indeterminate =
                getCheckedStatus({items, value}) === CheckedStatus.Partial
        },
        [items, value]
    )

    if (!isDisplayed(label, items)) {
        return null
    }

    return (
        <DropdownItem
            key={value}
            tag={(props) => <Label {...props} check />}
            toggle={false}
            className={css.item}
        >
            <input
                checked={isChecked(value)}
                className={classnames('mr-2', css.checkbox)}
                onChange={() => handleChange(value, items)}
                ref={handleIndeterminate}
                type="checkbox"
            />
            {` ${label}`}
        </DropdownItem>
    )
}

Group.displayName = 'SelectFilter.Group'

type Props = {
    children?: ReactElement<
        ComponentProps<typeof Item | typeof Group>,
        typeof Item | typeof Group
    >[]
    className?: string
    dropdownMenu?: ComponentType<ComponentProps<typeof DropdownMenu>>
    isDisabled?: boolean
    isMultiple?: boolean
    isRequired?: boolean
    onChange: (value: string[]) => void
    onSearch?: (query: string) => void
    plural?: string
    singular?: string
    value: string[]
}

const DefaultDropdownMenu = (props: ComponentProps<typeof DropdownMenu>) => (
    <DropdownMenu {...props} className={css.dropdown} />
)

const SelectFilter = ({
    children,
    className,
    dropdownMenu: DropdownMenuComponent = DefaultDropdownMenu,
    isDisabled = false,
    isRequired = false,
    isMultiple = true,
    onChange,
    onSearch,
    plural = 'items',
    singular = 'item',
    value,
}: Props) => {
    const [search, setSearch] = useState('')
    const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])

    useEffect(() => {
        onSearch?.(search)
    }, [search])

    const hasSelection = useMemo(() => !!value.length, [value])

    const items = useMemo(
        () =>
            children
                ? React.Children.toArray(children).filter(
                      (child) =>
                          child.type.displayName ===
                          SelectFilter.Item.displayName
                  )
                : [],
        [children]
    )

    const toggleLabel = useMemo(() => {
        if (isMultiple) {
            return hasSelection
                ? `${value.length} ${value.length > 1 ? plural : singular}`
                : `All ${plural}`
        }

        const selectedItem = items.find((item) => item.props.value === value[0])

        return selectedItem ? selectedItem.props.label : _capitalize(singular)
    }, [hasSelection, isMultiple, plural, singular, value])

    const groups = useMemo(
        () =>
            children
                ? (React.Children.toArray(children).filter(
                      (child) =>
                          child.type.displayName ===
                          SelectFilter.Group.displayName
                  ) as ReactElement<
                      ComponentProps<typeof Group>
                  >[]).map(({props: {value, items}}) => ({value, items}))
                : [],
        [children]
    )

    const updateGroupValue = (nextValue: string[]) => {
        selectedGroupIds.map((groupId) => {
            const group = groups?.find((group) => group.value === groupId)

            if (
                group &&
                !group.items.some((item) => nextValue.includes(item))
            ) {
                setSelectedGroupIds(_without(selectedGroupIds, groupId))
            }
        })
    }

    const handleItemChange = useCallback(
        (itemId: string) => {
            if (
                isDisabled ||
                (value.length === 1 && value[0] === itemId && isRequired)
            ) {
                return
            }

            let nextValue: string[]
            if (!isMultiple) {
                if (value[0] === itemId) {
                    nextValue = []
                } else {
                    nextValue = [itemId]
                }
            } else {
                nextValue = _xor(value, [itemId])
            }

            onChange(nextValue)
            updateGroupValue(nextValue)
        },
        [isDisabled, isMultiple, isRequired, value]
    )

    const handleGroupChange = useCallback(
        (groupId: string, items: string[]) => {
            if (isDisabled || !selectedGroupIds) {
                return
            }

            const nextValue = _xor(selectedGroupIds, [groupId])
            if (nextValue.length > selectedGroupIds.length) {
                onChange(_union(value, items))
            } else {
                onChange(_without(value, ...items))
            }
            setSelectedGroupIds(nextValue)
        },
        [isDisabled, selectedGroupIds, onChange]
    )

    const getCheckedStatus = useCallback(
        (group: Partial<GroupProps>) => {
            if (!selectedGroupIds.includes(group.value!)) {
                return CheckedStatus.Unchecked
            } else if (group.items?.every((item) => value.includes(item))) {
                return CheckedStatus.Checked
            }
            return CheckedStatus.Partial
        },
        [selectedGroupIds, value]
    )

    const isItemDisplayed = (label: string) =>
        search === '' || label.toLowerCase().includes(search.toLowerCase())

    const isGroupDisplayed = (label: string, groupItems: string[]) => {
        if (
            search === '' ||
            label?.toLowerCase().includes(search.toLowerCase())
        ) {
            return true
        }

        const groupItemValues = items.filter((item) =>
            groupItems?.includes(item.props.value)
        )
        if (
            groupItemValues.some((item) =>
                item.props.label.toLowerCase().includes(search.toLowerCase())
            )
        ) {
            return true
        }
        return false
    }

    return (
        <SelectFilterItemContext.Provider
            value={{
                handleChange: handleItemChange,
                isChecked: (item) => value.includes(item),
                isDisplayed: isItemDisplayed,
            }}
        >
            <SelectFilterGroupContext.Provider
                value={{
                    handleChange: handleGroupChange,
                    getCheckedStatus,
                    isChecked: (group) => selectedGroupIds?.includes(group),
                    isDisplayed: isGroupDisplayed,
                }}
            >
                <UncontrolledDropdown
                    disabled={isDisabled}
                    className={className}
                >
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
                        <div className={css.content}>{children}</div>
                        {hasSelection && !isRequired && (
                            <>
                                <DropdownItem divider />
                                <DropdownItem
                                    onClick={() => {
                                        if (isDisabled) {
                                            return
                                        }

                                        onChange([])
                                        setSelectedGroupIds([])
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
            </SelectFilterGroupContext.Provider>
        </SelectFilterItemContext.Provider>
    )
}

SelectFilter.Group = Group
SelectFilter.Item = Item

export default SelectFilter
