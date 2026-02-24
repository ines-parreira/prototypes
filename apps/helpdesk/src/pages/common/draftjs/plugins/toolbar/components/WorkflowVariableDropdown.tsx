import type { RefObject } from 'react'
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import VisualBuilderActionIcon from 'pages/automate/workflows/components/VisualBuilderActionIcon'
import {
    filterManyVariables,
    findManyVariables,
} from 'pages/automate/workflows/models/variables.model'
import type {
    WorkflowVariable,
    WorkflowVariableGroup,
} from 'pages/automate/workflows/models/variables.types'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Search from 'pages/common/components/Search'

import { useToolbarContext } from '../ToolbarContext'

import css from './WorkflowVariableDropdown.less'

type Props = {
    target: RefObject<HTMLElement | null>
    onSelect: (value: WorkflowVariable) => void
    isOpen: boolean
    dropdownPlacement?: React.ComponentProps<typeof Dropdown>['placement']
    noSelectedCategoryText?: string
    onToggle: (isOpen: boolean) => void
    isDisabled?: boolean
}

const WorkflowVariableDropdown = ({
    target,
    onSelect,
    isOpen,
    onToggle,
    dropdownPlacement = 'bottom-end',
    noSelectedCategoryText = 'Insert variable from previous steps',
    isDisabled,
}: Props) => {
    const {
        workflowVariables: workflowVariablesProp = [],
        workflowVariablesDataTypes = ['string', 'number', 'date', 'boolean'],
    } = useToolbarContext()

    const workflowVariables = useMemo(
        () =>
            filterManyVariables(workflowVariablesProp, (variable) =>
                workflowVariablesDataTypes.includes(variable.type),
            ),
        [workflowVariablesProp, workflowVariablesDataTypes],
    )
    const allVariables = useMemo(
        () =>
            findManyVariables(workflowVariables, (variable) => {
                if (
                    'value' in variable &&
                    workflowVariablesDataTypes.includes(variable.type)
                ) {
                    return variable
                }
            }),
        [workflowVariables, workflowVariablesDataTypes],
    )

    const [searchQuery, setSearchQuery] = useState<string>('')

    const [selectedCategory, setSelectedCategory] = useState<Omit<
        WorkflowVariableGroup,
        'nodeType'
    > | null>(null)

    const [searchResults, setSearchResults] = useState<
        WorkflowVariable[] | null
    >(null)
    const handleSearch = (query: string) => {
        setSearchQuery(query)

        if (query === '' && searchResults !== null) {
            setSearchResults(null)
            setSelectedCategory(null)
            return
        }

        if (selectedCategory == null) {
            const searchResults = allVariables.filter((variable) =>
                variable.name.toLowerCase().includes(query.toLowerCase()),
            )

            setSearchResults(searchResults)
        } else {
            const category = workflowVariables.find(
                (category) => category.name === selectedCategory?.name,
            )

            if (category && 'variables' in category) {
                const searchResults = category.variables.filter((variable) =>
                    variable.name.toLowerCase().includes(query.toLowerCase()),
                )

                setSelectedCategory({
                    name: category.name,
                    variables: searchResults,
                })
            }
        }
    }

    useEffect(() => {
        if (!isOpen) {
            setSelectedCategory(null)
            setSearchQuery('')
            setSearchResults(null)
        }
    }, [isOpen])

    const filteredOptions = selectedCategory
        ? selectedCategory.variables
        : workflowVariables

    const options = Array.isArray(searchResults)
        ? searchResults
        : filteredOptions

    return (
        <Dropdown
            isDisabled={isDisabled}
            isOpen={isOpen}
            target={target}
            className={css.dropdown}
            placement={dropdownPlacement}
            onToggle={onToggle}
            safeDistance={0}
        >
            {(selectedCategory || Array.isArray(searchResults)) && (
                <DropdownHeader className={css.dropdownHeader}>
                    <Button
                        onClick={() => {
                            if (Array.isArray(searchResults)) {
                                setSearchResults(null)
                            }
                            setSelectedCategory(null)
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
                                    : selectedCategory?.name}
                            </span>
                        </ButtonIconLabel>
                    </Button>
                </DropdownHeader>
            )}
            <DropdownBody>
                {workflowVariables.length > 0 && (
                    <Search
                        placeholder="Search for a variable"
                        className={css.search}
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                )}

                {!selectedCategory && (
                    <span className={css.header}>{noSelectedCategoryText}</span>
                )}
                {workflowVariables.length === 0 && (
                    <div>
                        <span className={css.noVariablesMessage}>
                            No variables available
                        </span>
                    </div>
                )}

                {options.length === 0 && searchQuery && (
                    <div>
                        <span className={css.noVariablesMessage}>
                            No results
                        </span>
                    </div>
                )}
                {options.map((option, index) => {
                    return (
                        <DropdownItem
                            key={`${option.name}-${index}`}
                            option={{
                                label: option.name,
                                value: index,
                            }}
                            onClick={() => {
                                if ('variables' in option) {
                                    setSelectedCategory(option)
                                } else {
                                    onToggle(false)

                                    onSelect(option)
                                }
                            }}
                            className={css.item}
                        >
                            <div className={css.itemContent}>
                                {option.icon
                                    ? option.icon
                                    : option.nodeType &&
                                      option.nodeType !==
                                          'reusable_llm_prompt_call' &&
                                      option.nodeType !== 'order_shipmonk' && (
                                          <VisualBuilderActionIcon
                                              nodeType={option.nodeType}
                                          />
                                      )}
                                <span className={css.itemName}>
                                    {option.name}
                                </span>
                            </div>
                            {!selectedCategory && 'variables' in option && (
                                <ButtonIconLabel
                                    icon="chevron_right"
                                    position="right"
                                    className={css.itemTrailIcon}
                                />
                            )}
                        </DropdownItem>
                    )
                })}
            </DropdownBody>
        </Dropdown>
    )
}

export default WorkflowVariableDropdown
