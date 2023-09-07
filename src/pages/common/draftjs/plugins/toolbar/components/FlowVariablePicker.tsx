import React, {useRef, useState} from 'react'
import classNames from 'classnames'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {FlowVariableGroup} from 'pages/automation/workflows/models/variables.types'
import VisualBuilderActionTag from 'pages/automation/workflows/components/VisualBuilderActionTag'
import Tooltip from 'pages/common/components/Tooltip'
import {useToolbarContext} from '../ToolbarContext'
import css from './FlowVariablePicker.less'

export interface FlowVariablePickerProps {
    onSelect: (value: string) => void
}
const FlowVariablePicker = ({onSelect}: FlowVariablePickerProps) => {
    const {availableFlowVariables = []} = useToolbarContext()

    const anchorEl = useRef<HTMLButtonElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [selectedCategory, setSelectedCategory] =
        useState<FlowVariableGroup | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const handleToggle = () => {
        setIsOpen(!isOpen)
    }

    const filteredOptions = selectedCategory
        ? selectedCategory.variables
        : availableFlowVariables

    return (
        <>
            <Tooltip target="variables">
                <span>
                    Variables are automatically created and can be used to
                    recall information from previous steps in a flow
                </span>
            </Tooltip>
            <Button
                id="variables"
                size="small"
                intent="secondary"
                ref={anchorEl}
                onClick={handleToggle}
            >
                {`{ }`} variables
                <ButtonIconLabel icon="arrow_drop_down" position="right" />
            </Button>

            <Dropdown
                isOpen={isOpen}
                target={anchorEl}
                ref={dropdownRef}
                className={css.dropdown}
                placement="bottom-end"
                onToggle={() => setIsOpen(!isOpen)}
                safeDistance={0}
            >
                {selectedCategory && (
                    <DropdownHeader>
                        <Button
                            onClick={() => setSelectedCategory(null)}
                            fillStyle="ghost"
                            className={classNames(css.backButton, css.header)}
                        >
                            <span className={css.headerCategory}>
                                <ButtonIconLabel
                                    icon="arrow_back"
                                    position="right"
                                    className={css.backButtonIcon}
                                />
                                {selectedCategory.name}
                            </span>
                        </Button>
                    </DropdownHeader>
                )}
                <DropdownBody>
                    {!selectedCategory && (
                        <span
                            className={classNames(
                                css.header,
                                css.headerNoCategory
                            )}
                        >
                            Insert variable from previous steps
                        </span>
                    )}
                    {availableFlowVariables.length === 0 && (
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
                                'variables' in option
                                    ? option.name
                                    : option.value,
                        }

                        return (
                            <DropdownItem
                                key={mappedOption.value}
                                option={mappedOption}
                                onClick={() => {
                                    if ('variables' in option) {
                                        setSelectedCategory(option)
                                    } else {
                                        setIsOpen(false)
                                        onSelect(option.value)
                                    }
                                }}
                                className={css.item}
                            >
                                <div className={css.itemContent}>
                                    {option.nodeType && (
                                        <VisualBuilderActionTag
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
        </>
    )
}

export default FlowVariablePicker
