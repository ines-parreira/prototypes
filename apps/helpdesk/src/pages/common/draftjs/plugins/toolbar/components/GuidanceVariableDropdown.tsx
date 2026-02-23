import type { RefObject } from 'react'
import React, { useEffect, useMemo, useState } from 'react'

import _capitalize from 'lodash/capitalize'

import { LegacyButton as Button } from '@gorgias/axiom'

import type {
    GuidanceVariable,
    GuidanceVariableGroup,
} from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Search from 'pages/common/components/Search'

import {
    findManyGuidanceVariables,
    pickCategoryLogo,
} from '../../guidance-variables/utils'
import { useToolbarContext } from '../ToolbarContext'

import css from './GuidanceVariableDropdown.less'

type Props = {
    target: RefObject<HTMLElement | null>
    onSelect: (value: GuidanceVariable) => void
    isOpen: boolean
    dropdownPlacement?: React.ComponentProps<typeof Dropdown>['placement']
    noSelectedCategoryText?: string
    onToggle: (isOpen: boolean) => void
    isDisabled?: boolean
}

const GuidanceVariableDropdown = ({
    target,
    onSelect,
    isOpen,
    onToggle,
    dropdownPlacement = 'bottom-end',
    noSelectedCategoryText = 'Insert variable',
    isDisabled,
}: Props) => {
    const { guidanceVariables: guidanceVariablesProp = [] } =
        useToolbarContext()

    const [searchQuery, setSearchQuery] = useState<string>('')

    const guidanceVariables = useMemo(
        () =>
            findManyGuidanceVariables(guidanceVariablesProp, (variable) => {
                if ('value' in variable) {
                    return variable
                }
                return undefined
            }),
        [guidanceVariablesProp],
    )

    const [selectedProvider, setSelectedProvider] =
        useState<GuidanceVariableGroup | null>(null)

    const [searchResults, setSearchResults] = useState<
        GuidanceVariable[] | null
    >(null)

    const handleSearch = (query: string) => {
        setSearchQuery(query)

        if (query === '' && searchResults !== null) {
            setSearchResults(null)
            return
        }

        if (selectedProvider == null) {
            const searchResults = guidanceVariables.filter((variable) =>
                variable.name.toLowerCase().includes(query.toLowerCase()),
            )

            setSearchResults(searchResults)
        } else {
            const allProviderVariables = findManyGuidanceVariables(
                [selectedProvider],
                (variable) => {
                    if ('value' in variable) {
                        return variable
                    }
                    return undefined
                },
            )

            const searchResults = allProviderVariables.filter((variable) =>
                variable.name.toLowerCase().includes(query.toLowerCase()),
            )

            setSearchResults(searchResults)
        }
    }

    useEffect(() => {
        if (!isOpen) {
            setSelectedProvider(null)
            setSearchQuery('')
            setSearchResults(null)
        }
    }, [isOpen])

    const groupedVariables = useMemo(() => {
        if (!selectedProvider) return null

        const allVariables = findManyGuidanceVariables(
            [selectedProvider],
            (variable) => {
                if ('value' in variable) {
                    return variable
                }
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

    // Determine what to display
    const displayOptions = useMemo(() => {
        if (searchResults) {
            return searchResults
        }

        if (!selectedProvider) {
            return guidanceVariablesProp
        }

        return null // We'll handle grouped variables separately
    }, [searchResults, selectedProvider, guidanceVariablesProp])

    const overlayRootNode = useMemo(
        () =>
            document.querySelector<HTMLElement>(
                '[class*="ui-sidepanel-sidepanel"]',
            ) ?? undefined,
        [],
    )

    return (
        <Dropdown
            root={overlayRootNode}
            isDisabled={isDisabled}
            isOpen={isOpen}
            target={target}
            className={css.dropdown}
            placement={dropdownPlacement}
            onToggle={onToggle}
            safeDistance={0}
        >
            {(selectedProvider || Array.isArray(searchResults)) && (
                <DropdownHeader className={css.dropdownHeader}>
                    <Button
                        onClick={() => {
                            if (Array.isArray(searchResults)) {
                                setSearchResults(null)
                            } else {
                                setSelectedProvider(null)
                            }
                            setSearchQuery('')
                        }}
                        fillStyle="ghost"
                        intent="secondary"
                        className={css.backButton}
                    >
                        <ButtonIconLabel
                            icon="arrow_back"
                            position="left"
                            className={css.backButtonIconLabel}
                        >
                            <span className={css.categoryName}>
                                {searchResults
                                    ? 'Search results'
                                    : selectedProvider?.name}
                            </span>
                        </ButtonIconLabel>
                    </Button>
                </DropdownHeader>
            )}
            <DropdownBody>
                {guidanceVariablesProp.length > 0 && (
                    <Search
                        placeholder="Search"
                        className={css.search}
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                )}

                {!selectedProvider && !searchResults && (
                    <span className={css.header}>{noSelectedCategoryText}</span>
                )}
                {guidanceVariablesProp.length === 0 && (
                    <div>
                        <span className={css.noVariablesMessage}>
                            No variables available
                        </span>
                    </div>
                )}

                {displayOptions &&
                    displayOptions.length === 0 &&
                    searchQuery && (
                        <div>
                            <span className={css.noVariablesMessage}>
                                No results
                            </span>
                        </div>
                    )}

                {displayOptions &&
                    displayOptions.map((option, index) => {
                        return (
                            <DropdownItem
                                key={`${option.name}-${index}`}
                                option={{
                                    label: option.name,
                                    value: index,
                                }}
                                onClick={() => {
                                    if ('variables' in option) {
                                        setSelectedProvider(option)
                                    } else {
                                        onSelect(option)
                                        onToggle(false)
                                    }
                                }}
                                className={css.item}
                            >
                                <div className={css.itemContent}>
                                    <span className={css.itemIcon}>
                                        <img
                                            src={
                                                pickCategoryLogo(option.name)
                                                    .src
                                            }
                                            alt={
                                                pickCategoryLogo(option.name)
                                                    .alt
                                            }
                                            className={css.shopifyLogo}
                                            width={20}
                                            height={20}
                                        />
                                    </span>
                                    <span className={css.itemName}>
                                        {'category' in option
                                            ? `${_capitalize(option.category)}: ${option.name}`
                                            : option.name}
                                    </span>
                                </div>
                                {!selectedProvider &&
                                    !searchResults &&
                                    'variables' in option && (
                                        <ButtonIconLabel
                                            icon="chevron_right"
                                            position="right"
                                            className={css.itemTrailIcon}
                                        />
                                    )}
                            </DropdownItem>
                        )
                    })}

                {groupedVariables &&
                    !searchResults &&
                    Object.entries(groupedVariables).map(
                        ([category, variables]) => (
                            <React.Fragment key={category}>
                                {/* Category header */}
                                <div className={css.header}>
                                    {category.toUpperCase()}
                                </div>

                                {variables.map((variable, index) => (
                                    <DropdownItem
                                        key={`${variable.name}-${index}`}
                                        option={{
                                            label: variable.name,
                                            value: index,
                                        }}
                                        onClick={() => {
                                            onToggle(false)
                                            onSelect(variable)
                                        }}
                                        className={css.item}
                                    >
                                        <div className={css.itemContent}>
                                            <span className={css.itemIcon}>
                                                <img
                                                    src={
                                                        pickCategoryLogo(
                                                            variable.category,
                                                        ).src
                                                    }
                                                    alt={
                                                        pickCategoryLogo(
                                                            variable.category,
                                                        ).alt
                                                    }
                                                    className={css.shopifyLogo}
                                                    width={20}
                                                    height={20}
                                                />
                                            </span>
                                            <span className={css.itemName}>
                                                {variable.name}
                                            </span>
                                        </div>
                                    </DropdownItem>
                                ))}
                            </React.Fragment>
                        ),
                    )}
            </DropdownBody>
        </Dropdown>
    )
}

export default GuidanceVariableDropdown
