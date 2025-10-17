import React, {
    Children,
    ComponentProps,
    ComponentType,
    createContext,
    KeyboardEvent,
    MouseEvent,
    ReactElement,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import classnames from 'classnames'
import _capitalize from 'lodash/capitalize'
import _union from 'lodash/union'
import _without from 'lodash/without'
import _xor from 'lodash/xor'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
    UncontrolledDropdown,
} from 'reactstrap'

import { Tooltip } from '@gorgias/axiom'

import QuickSelectionOption from 'domains/reporting/pages/common/QuickSelectionOption'
import css from 'domains/reporting/pages/common/SelectFilter.less'
import {
    statFiltersClean,
    statFiltersDirty,
} from 'domains/reporting/state/ui/stats/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import { LabelWithTooltip } from 'pages/common/components/LabelWithTooltip/LabelWithTooltip'
import CheckBox from 'pages/common/forms/CheckBox'

type Value = string | number

enum CheckedStatus {
    Checked = 'checked',
    Unchecked = 'unchecked',
    Partial = 'partial',
}

interface ItemContext {
    handleChange: (itemId: Value) => void
    isChecked: (value: Value) => boolean
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
    value: Value
    icon?: string | ReactNode
}

const Item = ({ label, value, icon }: ItemProps) => {
    const { handleChange, isChecked, isDisplayed } = useContext(
        SelectFilterItemContext,
    )

    if (!isDisplayed(label)) {
        return null
    }

    return (
        <CheckBox
            className={css.wrapperItem}
            labelClassName={css.labelItem}
            isChecked={isChecked(value)}
            onChange={() => handleChange(value)}
        >
            {icon ? (
                typeof icon === 'string' ? (
                    <i className={classnames('icon material-icons', css.icon)}>
                        {icon}
                    </i>
                ) : (
                    icon
                )
            ) : null}
            <LabelWithTooltip label={label} />
        </CheckBox>
    )
}

Item.displayName = 'SelectFilter.Item'

export type GroupProps = {
    items: Value[]
    label: string
    value: Value
}

interface GroupContext {
    getCheckedStatus: (group: Partial<GroupProps>) => CheckedStatus
    handleChange: (groupId: Value, items: Value[]) => void
    isChecked: (value: Value) => boolean
    isDisplayed: (label: string, items: Value[]) => boolean
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

const Group = ({ items, label, value }: GroupProps) => {
    const { getCheckedStatus, handleChange, isChecked, isDisplayed } =
        useContext(SelectFilterGroupContext)

    if (!isDisplayed(label, items)) {
        return null
    }

    return (
        <CheckBox
            className={css.wrapperItem}
            labelClassName={css.labelItem}
            isChecked={isChecked(value)}
            onChange={() => handleChange(value, items)}
            isIndeterminate={
                getCheckedStatus({ items, value }) === CheckedStatus.Partial
            }
        >
            <LabelWithTooltip label={label} />
        </CheckBox>
    )
}

Group.displayName = 'SelectFilter.Group'

type ItemElement = ReactElement<ComponentProps<typeof Item>, typeof Item>
type GroupElement = ReactElement<ComponentProps<typeof Group>, typeof Group>

type Props = {
    children?: ReactNode
    className?: string
    toggleClassName?: string
    dropdownMenu?: ComponentType<ComponentProps<typeof DropdownMenu>>
    dropdownMenuProps?: ComponentProps<typeof DropdownMenu>
    isDisabled?: boolean
    isMultiple?: boolean
    isPartial?: boolean
    isRequired?: boolean
    onChange: (value: Value[]) => void
    onClose?: () => void
    onSearch?: (query: string) => void
    plural?: string
    singular?: string
    value: Value[]
    size?: 'sm' | 'lg'
    // Override the generic singular/plural button label
    label?: string
    // Override the search placeholder
    searchPlaceholder?: string
    disabledTooltipText?: string
    // Hide the selected count in the button label
    hideSelectedCount?: boolean
}

const DefaultDropdownMenu = ({
    className,
    ...props
}: ComponentProps<typeof DropdownMenu>) => (
    <DropdownMenu {...props} className={classnames(css.dropdown, className)} />
)

/**
 * @deprecated
 * @date 2025-06-02
 * @type feature-component
 */
const SelectFilter = ({
    children,
    className,
    dropdownMenu: DropdownMenuComponent = DefaultDropdownMenu,
    dropdownMenuProps,
    isDisabled = false,
    isRequired = false,
    isMultiple = true,
    isPartial = false,
    onChange,
    onClose,
    onSearch,
    plural = 'items',
    singular = 'item',
    value,
    toggleClassName = 'mr-2',
    size,
    label,
    searchPlaceholder,
    disabledTooltipText,
    hideSelectedCount,
}: Props) => {
    const dispatch = useAppDispatch()
    const [search, setSearch] = useState('')
    const [selectedGroupIds, setSelectedGroupIds] = useState<Value[]>([])
    const toggleRef = useRef<HTMLButtonElement>()

    useEffect(() => {
        onSearch?.(search)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search])

    const hasSelection = useMemo(() => !!value.length, [value])

    const getItems = useCallback((children: ReactNode): ItemElement[] => {
        const items: ItemElement[] = []

        React.Children.toArray(children).forEach((child) => {
            if (React.isValidElement(child)) {
                // If this child has nested children, recurse
                if (
                    child.props.children &&
                    typeof child.props.children === 'object'
                ) {
                    items.push(...getItems(child.props.children))
                }

                // If it's an <Item />, collect it
                if (
                    child.type === Item ||
                    (child.type as any).displayName ===
                        SelectFilter.Item.displayName
                ) {
                    items.push(child as ItemElement)
                }
            }
        })

        return items
    }, [])

    const items = useMemo(
        () => (children ? getItems(children) : []),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [children],
    )

    const toggleLabel = useMemo(() => {
        if (label) {
            return label
        }
        if (isMultiple) {
            if (hideSelectedCount) {
                return hasSelection ? _capitalize(plural) : `All ${plural}`
            }
            return hasSelection
                ? `${value.length} ${value.length > 1 ? plural : singular}`
                : `All ${plural}`
        }

        const selectedItem = items.find((item) => item.props.value === value[0])

        return selectedItem ? selectedItem.props.label : _capitalize(singular)
    }, [
        hasSelection,
        isMultiple,
        items,
        plural,
        singular,
        value,
        label,
        hideSelectedCount,
    ])

    const groups = useMemo(
        () =>
            children
                ? (
                      Children.toArray(children).filter(
                          (child) =>
                              (child as GroupElement).type.displayName ===
                              SelectFilter.Group.displayName,
                      ) as GroupElement[]
                  ).map(({ props: { value, items } }) => ({
                      value,
                      items,
                  }))
                : [],
        [children],
    )

    const updateGroupValue = (nextValue: Value[]) => {
        const removedGroupIds: Value[] = []
        selectedGroupIds.map((groupId) => {
            const group = groups?.find((group) => group.value === groupId)

            if (
                group?.items.length &&
                !group.items.some((item) => nextValue.includes(item))
            ) {
                removedGroupIds.push(groupId)
            }
        })
        setSelectedGroupIds(_without(selectedGroupIds, ...removedGroupIds))
    }

    const handleItemChange = useCallback(
        (itemId: Value) => {
            if (
                isDisabled ||
                (value.length === 1 && value[0] === itemId && isRequired)
            ) {
                return
            }

            let nextValue: Value[]
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isDisabled, isMultiple, isRequired, value, onChange],
    )

    const handleToggle = useCallback(
        (
            event: KeyboardEvent<Element> | MouseEvent<Element>,
            isOpen: boolean,
        ) => {
            if (isOpen && event.currentTarget === toggleRef.current) {
                dispatch(statFiltersDirty())
            } else {
                dispatch(statFiltersClean())
                onClose?.()
            }
        },
        [dispatch, onClose],
    )

    const handleGroupChange = useCallback(
        (groupId: Value, items: Value[]) => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isDisabled, selectedGroupIds, onChange],
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
        [selectedGroupIds, value],
    )

    const isItemDisplayed = (label: string) =>
        search === '' || label.toLowerCase().includes(search.toLowerCase())

    const isGroupDisplayed = (label: string, groupItems: Value[]) => {
        if (
            search === '' ||
            label?.toLowerCase().includes(search.toLowerCase())
        ) {
            return true
        }

        const groupItemValues = items.filter((item) =>
            groupItems?.includes(item.props.value),
        )
        if (
            groupItemValues.some((item) =>
                item.props.label.toLowerCase().includes(search.toLowerCase()),
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
                    onToggle={handleToggle}
                    size={size}
                >
                    {isDisabled && disabledTooltipText && (
                        <Tooltip
                            target={'select-filter-dropdown-toggle-button'}
                            placement="top"
                        >
                            {disabledTooltipText}
                        </Tooltip>
                    )}
                    <DropdownToggle
                        id="select-filter-dropdown-toggle-button"
                        caret
                        className={classnames(
                            toggleClassName,
                            css.dropdownToggle,
                        )}
                        color="secondary"
                        type="button"
                        disabled={isDisabled}
                        innerRef={toggleRef}
                    >
                        <span>{toggleLabel}</span>
                    </DropdownToggle>
                    <DropdownMenuComponent right {...dropdownMenuProps}>
                        <DropdownItem
                            header
                            className={classnames(
                                'dropdown-item-input',
                                css.dropdownItemInput,
                            )}
                        >
                            <Input
                                autoFocus
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={`Search ${searchPlaceholder ?? `${plural}...`}`}
                                value={search}
                            />
                        </DropdownItem>
                        {!isRequired && isMultiple && (
                            <QuickSelectionOption
                                className={css.quickSelectionOption}
                                totalItemsCount={items.length}
                                selectedItemsCount={value.length}
                                onClick={() => {
                                    if (value.length) {
                                        onChange([])
                                        setSelectedGroupIds([])
                                    } else {
                                        onChange(
                                            items.map(
                                                ({ props: { value } }) => value,
                                            ),
                                        )
                                        setSelectedGroupIds(
                                            groups.map(({ value }) => value),
                                        )
                                    }
                                }}
                                isPartial={isPartial}
                                hideCount={hideSelectedCount}
                            />
                        )}
                        <DropdownItem divider className={css.dropdownDivider} />
                        <div className={css.content}>{children}</div>
                    </DropdownMenuComponent>
                </UncontrolledDropdown>
            </SelectFilterGroupContext.Provider>
        </SelectFilterItemContext.Provider>
    )
}

SelectFilter.Group = Group
SelectFilter.Item = Item

export default SelectFilter
