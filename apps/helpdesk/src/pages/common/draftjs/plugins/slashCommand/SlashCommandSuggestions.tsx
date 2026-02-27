import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'

import cn from 'classnames'

import { Button, Icon } from '@gorgias/axiom'

import type {
    GuidanceVariable,
    GuidanceVariableGroup,
    GuidanceVariableList,
} from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Search from 'pages/common/components/Search'
import {
    findManyGuidanceVariables,
    pickCategoryIconName,
} from 'pages/common/draftjs/plugins/guidance-variables/utils'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import { encodeAction } from 'pages/common/draftjs/plugins/guidanceActions/utils'

import type { NavigableItem, SlashCommandItem } from './types'

import css from './SlashCommandSuggestions.less'

type Props = {
    items: SlashCommandItem[]
    variableList: GuidanceVariableList
    guidanceActions: GuidanceAction[]
    searchText: string
    isOpen: boolean
    position: { top: number; left: number } | null
    highlightedIndex: number
    selectHighlightedRef: MutableRefObject<(() => void) | null>
    navigateLeftRef: MutableRefObject<(() => boolean) | null>
    onSelect: (item: SlashCommandItem) => void
    onClose: () => void
    onInteractionStart: () => void
    onSearchTextChange: (text: string) => void
    onSearchFocusChange: (focused: boolean) => void
    onNavigate: (direction: 'up' | 'down') => void
    onItemCountChange: (count: number) => void
    onProviderViewChange: (inProvider: boolean) => void
    onCanNavigateRightChange: (canNavigate: boolean) => void
    onResetHighlight: () => void
}

export default function SlashCommandSuggestions({
    items,
    variableList,
    guidanceActions,
    searchText,
    isOpen,
    position,
    highlightedIndex,
    selectHighlightedRef,
    navigateLeftRef,
    onSelect,
    onClose,
    onInteractionStart,
    onSearchTextChange,
    onSearchFocusChange,
    onNavigate,
    onItemCountChange,
    onProviderViewChange,
    onCanNavigateRightChange,
    onResetHighlight,
}: Props) {
    const anchorRef = useRef<HTMLSpanElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const highlightedItemRef = useRef<HTMLDivElement>(null)
    const [selectedProvider, setSelectedProvider] =
        useState<GuidanceVariableGroup | null>(null)

    useEffect(() => {
        const el = contentRef.current
        if (!el) return
        const handler = () => onInteractionStart()
        el.addEventListener('pointerdown', handler, { capture: true })
        return () =>
            el.removeEventListener('pointerdown', handler, { capture: true })
    }, [onInteractionStart, isOpen, position])

    useEffect(() => {
        if (!isOpen) {
            setSelectedProvider(null)
        }
    }, [isOpen])

    // Sync provider view state to plugin
    useEffect(() => {
        onProviderViewChange(!!selectedProvider)
    }, [selectedProvider, onProviderViewChange])

    // Reset highlight when provider changes
    useEffect(() => {
        onResetHighlight()
    }, [selectedProvider, onResetHighlight])

    const filteredVariables = useMemo(() => {
        if (!searchText) return null
        const lower = searchText.toLowerCase()
        const allVars = findManyGuidanceVariables(variableList, (v) => {
            if ('value' in v) return v
            return undefined
        })
        return allVars.filter((v) => v.name.toLowerCase().includes(lower))
    }, [variableList, searchText])

    const filteredActions = useMemo(() => {
        if (!searchText) return null
        const lower = searchText.toLowerCase()
        return guidanceActions.filter((a) =>
            a.name.toLowerCase().includes(lower),
        )
    }, [guidanceActions, searchText])

    const groupedVariables = useMemo(() => {
        if (!selectedProvider) return null

        const allVariables = findManyGuidanceVariables(
            [selectedProvider],
            (variable) => {
                if ('value' in variable) return variable
                return undefined
            },
        )

        const categoriesMap: Record<string, GuidanceVariable[]> = {}
        allVariables.forEach((variable) => {
            if (!categoriesMap[variable.category]) {
                categoriesMap[variable.category] = []
            }
            categoriesMap[variable.category].push(variable)
        })

        Object.keys(categoriesMap).forEach((category) => {
            categoriesMap[category].sort((a, b) => a.name.localeCompare(b.name))
        })

        return categoriesMap
    }, [selectedProvider])

    const navigableItems = useMemo((): NavigableItem[] => {
        const result: NavigableItem[] = []

        if (selectedProvider && groupedVariables) {
            for (const variables of Object.values(groupedVariables)) {
                for (const variable of variables) {
                    result.push({ type: 'variable', variable })
                }
            }
        } else if (searchText.length > 0) {
            if (filteredVariables) {
                for (const variable of filteredVariables) {
                    result.push({ type: 'variable', variable })
                }
            }
            if (filteredActions) {
                for (const action of filteredActions) {
                    result.push({ type: 'action', action })
                }
            }
        } else {
            for (const item of variableList) {
                if ('variables' in item) {
                    result.push({ type: 'group', group: item })
                } else {
                    result.push({ type: 'variable', variable: item })
                }
            }
            for (const action of guidanceActions) {
                result.push({ type: 'action', action })
            }
        }

        return result
    }, [
        selectedProvider,
        groupedVariables,
        searchText,
        filteredVariables,
        filteredActions,
        variableList,
        guidanceActions,
    ])

    useEffect(() => {
        onItemCountChange(navigableItems.length)
    }, [navigableItems.length, onItemCountChange])

    // Sync canNavigateRight to plugin
    useEffect(() => {
        const item = navigableItems[highlightedIndex]
        onCanNavigateRightChange(item?.type === 'group')
    }, [navigableItems, highlightedIndex, onCanNavigateRightChange])

    // Wire up navigateLeftRef
    useEffect(() => {
        navigateLeftRef.current = () => {
            if (selectedProvider) {
                setSelectedProvider(null)
                return true
            }
            return false
        }
    }, [navigateLeftRef, selectedProvider])

    const handleVariableSelect = useCallback(
        (variable: GuidanceVariable) => {
            onSelect({
                label: variable.name,
                value: variable.value,
                type: 'variable',
                category: variable.category,
            })
        },
        [onSelect],
    )

    const handleActionSelect = useCallback(
        (action: GuidanceAction) => {
            onSelect({
                label: action.name,
                value: encodeAction(action),
                type: 'action',
            })
        },
        [onSelect],
    )

    const selectItem = useCallback(
        (item: NavigableItem | undefined) => {
            if (!item) return
            switch (item.type) {
                case 'group':
                    setSelectedProvider(item.group)
                    break
                case 'variable':
                    handleVariableSelect(item.variable)
                    break
                case 'action':
                    handleActionSelect(item.action)
                    break
            }
        },
        [handleVariableSelect, handleActionSelect],
    )

    useEffect(() => {
        selectHighlightedRef.current = () => {
            selectItem(navigableItems[highlightedIndex])
        }
    }, [selectHighlightedRef, selectItem, navigableItems, highlightedIndex])

    useEffect(() => {
        highlightedItemRef.current?.scrollIntoView({ block: 'nearest' })
    }, [highlightedIndex])

    const handleToggle = (open: boolean) => {
        if (!open) {
            onClose()
        }
    }

    const handleSearchKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                onNavigate('down')
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                onNavigate('up')
            } else if (e.key === 'Enter') {
                e.preventDefault()
                selectHighlightedRef.current?.()
            } else if (e.key === 'ArrowRight') {
                const item = navigableItems[highlightedIndex]
                if (item?.type === 'group') {
                    e.preventDefault()
                    selectItem(item)
                }
            }
        },
        [
            onNavigate,
            selectHighlightedRef,
            navigableItems,
            highlightedIndex,
            selectItem,
        ],
    )

    const overlayRootNode = useMemo(
        () =>
            document.querySelector<HTMLElement>(
                '[class*="ui-sidepanel-sidepanel"]',
            ) ?? undefined,
        [],
    )

    const isSearching = searchText.length > 0
    const hasVariables = variableList.length > 0
    const hasActions = guidanceActions.length > 0
    const hasNoResults = isSearching && items.length === 0

    let navCounter = 0

    function getNavIndex() {
        return navCounter++
    }

    function itemClassName(navIndex: number) {
        return cn(
            css.item,
            navIndex === highlightedIndex && css.itemHighlighted,
        )
    }

    function highlightRef(navIndex: number) {
        return navIndex === highlightedIndex ? highlightedItemRef : undefined
    }

    return (
        <>
            <span
                ref={anchorRef}
                style={
                    position
                        ? {
                              position: 'fixed',
                              top: position.top,
                              left: position.left,
                              width: 0,
                              height: 0,
                              pointerEvents: 'none',
                          }
                        : { display: 'none' }
                }
                aria-hidden
            />
            <Dropdown
                root={overlayRootNode}
                isOpen={isOpen && position !== null}
                target={anchorRef}
                className={css.dropdown}
                placement="bottom-start"
                onToggle={handleToggle}
                safeDistance={0}
            >
                <div
                    ref={contentRef}
                    className={css.content}
                    onMouseDown={(e) => {
                        if (!(e.target instanceof HTMLInputElement)) {
                            e.preventDefault()
                        }
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {selectedProvider && (
                        <DropdownHeader className={css.dropdownHeader}>
                            <Button
                                onClick={() => setSelectedProvider(null)}
                                variant="tertiary"
                                className={css.backButton}
                                leadingSlot="arrow-chevron-left"
                            >
                                <span className={css.categoryName}>
                                    {selectedProvider.name}
                                </span>
                            </Button>
                        </DropdownHeader>
                    )}
                    <DropdownBody>
                        {!selectedProvider && (
                            <Search
                                placeholder="Search"
                                className={css.search}
                                value={searchText}
                                onChange={onSearchTextChange}
                                onKeyDown={handleSearchKeyDown}
                                onFocus={() => onSearchFocusChange(true)}
                                onBlur={() => onSearchFocusChange(false)}
                            />
                        )}

                        {hasNoResults && (
                            <div className={css.noResults}>No results</div>
                        )}

                        {isSearching && !selectedProvider && (
                            <>
                                {filteredVariables &&
                                    filteredVariables.length > 0 && (
                                        <>
                                            <div className={css.header}>
                                                INSERT VARIABLE
                                            </div>
                                            {filteredVariables.map(
                                                (variable, index) => {
                                                    const navIndex =
                                                        getNavIndex()
                                                    return (
                                                        <DropdownItem
                                                            key={`var-${variable.value}-${index}`}
                                                            ref={highlightRef(
                                                                navIndex,
                                                            )}
                                                            option={{
                                                                label: variable.name,
                                                                value: index,
                                                            }}
                                                            onClick={() =>
                                                                handleVariableSelect(
                                                                    variable,
                                                                )
                                                            }
                                                            className={itemClassName(
                                                                navIndex,
                                                            )}
                                                        >
                                                            <div
                                                                className={
                                                                    css.itemContent
                                                                }
                                                            >
                                                                <span
                                                                    className={
                                                                        css.itemIcon
                                                                    }
                                                                >
                                                                    <Icon
                                                                        name={pickCategoryIconName(
                                                                            variable.category,
                                                                        )}
                                                                        size="sm"
                                                                        color="green"
                                                                    />
                                                                </span>
                                                                <span
                                                                    className={
                                                                        css.itemName
                                                                    }
                                                                >
                                                                    {variable.category ===
                                                                    'customer'
                                                                        ? 'Customer'
                                                                        : 'Order'}
                                                                    :{' '}
                                                                    {
                                                                        variable.name
                                                                    }
                                                                </span>
                                                            </div>
                                                        </DropdownItem>
                                                    )
                                                },
                                            )}
                                        </>
                                    )}
                                {filteredActions &&
                                    filteredActions.length > 0 && (
                                        <>
                                            <div className={css.header}>
                                                INSERT ACTION
                                            </div>
                                            {filteredActions.map(
                                                (action, index) => {
                                                    const navIndex =
                                                        getNavIndex()
                                                    return (
                                                        <DropdownItem
                                                            key={`action-${action.value}-${index}`}
                                                            ref={highlightRef(
                                                                navIndex,
                                                            )}
                                                            option={{
                                                                label: action.name,
                                                                value: index,
                                                            }}
                                                            onClick={() =>
                                                                handleActionSelect(
                                                                    action,
                                                                )
                                                            }
                                                            className={itemClassName(
                                                                navIndex,
                                                            )}
                                                        >
                                                            <div
                                                                className={
                                                                    css.itemContent
                                                                }
                                                            >
                                                                <span
                                                                    className={
                                                                        css.itemIcon
                                                                    }
                                                                >
                                                                    <span className="material-icons">
                                                                        webhook
                                                                    </span>
                                                                </span>
                                                                <span
                                                                    className={
                                                                        css.itemName
                                                                    }
                                                                >
                                                                    {
                                                                        action.name
                                                                    }
                                                                </span>
                                                            </div>
                                                        </DropdownItem>
                                                    )
                                                },
                                            )}
                                        </>
                                    )}
                            </>
                        )}

                        {!isSearching && !selectedProvider && (
                            <>
                                {hasVariables && (
                                    <>
                                        <div className={css.header}>
                                            INSERT VARIABLE
                                        </div>
                                        {variableList.map((option, index) => {
                                            const navIndex = getNavIndex()
                                            return (
                                                <DropdownItem
                                                    key={`group-${option.name}-${index}`}
                                                    ref={highlightRef(navIndex)}
                                                    option={{
                                                        label: option.name,
                                                        value: index,
                                                    }}
                                                    onClick={() => {
                                                        if (
                                                            'variables' in
                                                            option
                                                        ) {
                                                            setSelectedProvider(
                                                                option,
                                                            )
                                                        } else {
                                                            handleVariableSelect(
                                                                option,
                                                            )
                                                        }
                                                    }}
                                                    className={itemClassName(
                                                        navIndex,
                                                    )}
                                                >
                                                    <div
                                                        className={
                                                            css.itemContent
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                css.itemIcon
                                                            }
                                                        >
                                                            <Icon
                                                                name={pickCategoryIconName(
                                                                    'category' in
                                                                        option
                                                                        ? option.category
                                                                        : option.name,
                                                                )}
                                                                size="sm"
                                                                color="gray"
                                                            />
                                                        </span>
                                                        <span
                                                            className={
                                                                css.itemName
                                                            }
                                                        >
                                                            {option.name}
                                                        </span>
                                                    </div>
                                                    {'variables' in option && (
                                                        <span
                                                            className={
                                                                css.itemTrailIcon
                                                            }
                                                        >
                                                            <Icon name="arrow-chevron-right" />
                                                        </span>
                                                    )}
                                                </DropdownItem>
                                            )
                                        })}
                                    </>
                                )}

                                {hasActions && (
                                    <>
                                        <div className={css.header}>
                                            INSERT ACTION
                                        </div>
                                        {guidanceActions.map(
                                            (action, index) => {
                                                const navIndex = getNavIndex()
                                                return (
                                                    <DropdownItem
                                                        key={`action-${action.value}-${index}`}
                                                        ref={highlightRef(
                                                            navIndex,
                                                        )}
                                                        option={{
                                                            label: action.name,
                                                            value: index,
                                                        }}
                                                        onClick={() =>
                                                            handleActionSelect(
                                                                action,
                                                            )
                                                        }
                                                        className={itemClassName(
                                                            navIndex,
                                                        )}
                                                    >
                                                        <div
                                                            className={
                                                                css.itemContent
                                                            }
                                                        >
                                                            <span
                                                                className={
                                                                    css.itemIcon
                                                                }
                                                            >
                                                                <span className="material-icons">
                                                                    webhook
                                                                </span>
                                                            </span>
                                                            <span
                                                                className={
                                                                    css.itemName
                                                                }
                                                            >
                                                                {action.name}
                                                            </span>
                                                        </div>
                                                    </DropdownItem>
                                                )
                                            },
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        {selectedProvider &&
                            groupedVariables &&
                            Object.entries(groupedVariables).map(
                                ([category, variables]) => (
                                    <React.Fragment key={category}>
                                        <div className={css.header}>
                                            {category.toUpperCase()}
                                        </div>
                                        {variables.map((variable, index) => {
                                            const navIndex = getNavIndex()
                                            return (
                                                <DropdownItem
                                                    key={`${variable.name}-${index}`}
                                                    ref={highlightRef(navIndex)}
                                                    option={{
                                                        label: variable.name,
                                                        value: index,
                                                    }}
                                                    onClick={() =>
                                                        handleVariableSelect(
                                                            variable,
                                                        )
                                                    }
                                                    className={itemClassName(
                                                        navIndex,
                                                    )}
                                                >
                                                    <div
                                                        className={
                                                            css.itemContent
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                css.itemIcon
                                                            }
                                                        >
                                                            <Icon
                                                                name={pickCategoryIconName(
                                                                    variable.category,
                                                                )}
                                                                size="sm"
                                                            />
                                                        </span>
                                                        <span
                                                            className={
                                                                css.itemName
                                                            }
                                                        >
                                                            {variable.name}
                                                        </span>
                                                    </div>
                                                </DropdownItem>
                                            )
                                        })}
                                    </React.Fragment>
                                ),
                            )}
                    </DropdownBody>
                </div>
            </Dropdown>
        </>
    )
}
