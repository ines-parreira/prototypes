import React, {RefObject, useEffect, useMemo, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {
    WorkflowVariable,
    WorkflowVariableGroup,
} from 'pages/automate/workflows/models/variables.types'
import VisualBuilderActionIcon from 'pages/automate/workflows/components/VisualBuilderActionIcon'
import {useToolbarContext} from '../ToolbarContext'

import css from './WorkflowVariableDropdown.less'

type Props = {
    target: RefObject<HTMLElement | null>
    onSelect: (value: WorkflowVariable) => void
    isOpen: boolean
    dropdownPlacement?: React.ComponentProps<typeof Dropdown>['placement']
    noSelectedCategoryText?: string
    onToggle: (isOpen: boolean) => void
}

const WorkflowVariableDropdown = ({
    target,
    onSelect,
    isOpen,
    onToggle,
    dropdownPlacement = 'bottom-end',
    noSelectedCategoryText = 'Insert variable from previous steps',
}: Props) => {
    const {
        workflowVariables: workflowVariablesProp = [],
        workflowVariablesNodeTypes = [
            'text_reply',
            'multiple_choices',
            'order_selection',
            'http_request',
            'shopper_authentication',
        ],
    } = useToolbarContext()

    const [selectedCategory, setSelectedCategory] =
        useState<WorkflowVariableGroup | null>(null)

    useEffect(() => {
        if (!isOpen) {
            setSelectedCategory(null)
        }
    }, [isOpen])

    const workflowVariables = useMemo(
        () =>
            workflowVariablesProp.filter(
                (variable) =>
                    variable.nodeType &&
                    workflowVariablesNodeTypes.includes(variable.nodeType)
            ),
        [workflowVariablesProp, workflowVariablesNodeTypes]
    )

    const filteredOptions = selectedCategory
        ? selectedCategory.variables
        : workflowVariables

    return (
        <Dropdown
            isOpen={isOpen}
            target={target}
            className={css.dropdown}
            placement={dropdownPlacement}
            onToggle={onToggle}
            safeDistance={0}
        >
            {selectedCategory && (
                <DropdownHeader>
                    <Button
                        onClick={() => setSelectedCategory(null)}
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
                                {selectedCategory.name}
                            </span>
                        </ButtonIconLabel>
                    </Button>
                </DropdownHeader>
            )}
            <DropdownBody>
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
                {filteredOptions.map((option) => {
                    const mappedOption = {
                        label: option.name,
                        value:
                            'variables' in option ? option.name : option.value,
                    }

                    return (
                        <DropdownItem
                            key={mappedOption.value}
                            option={mappedOption}
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
                                {option.nodeType && (
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
