import React, { useRef, useState } from 'react'

import { capitalize } from 'lodash'

import { LegacyButton as Button } from '@gorgias/axiom'

import IconButton from 'pages/common/components/button/IconButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from './Condition.less'

type Operator = {
    label: string
    key: string
    isDisabled?: boolean
}

export type ConditionProps = {
    label: string
    operators: Operator[]
    isFirst: boolean
    type: string
    children: React.ReactNode
    selectedOperatorValue: string
    onOperatorSelect: (key: string) => void
    onDelete?: () => void
    isDisabled?: boolean
    icon?: React.ReactNode
}

export const Condition = ({
    label,
    operators,
    selectedOperatorValue,
    type,
    isFirst,
    children,
    onDelete,
    onOperatorSelect,
    isDisabled,
    icon,
}: ConditionProps) => {
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const selectRef = useRef<HTMLDivElement>(null)
    const floatingSelectRef = useRef<HTMLDivElement>(null)

    const selectedOperatorLabel = operators.find(
        (operator) => operator.key === selectedOperatorValue,
    )?.label

    return (
        <div className={css.container}>
            {!isFirst && (
                <Button className={css.type}>{capitalize(type)}</Button>
            )}
            <div className={css.labelWrapper}>
                {icon}
                <span className={css.label}>{label}</span>
            </div>

            <SelectInputBox
                className={css.selectInput}
                ref={selectRef}
                floating={floatingSelectRef}
                onToggle={setIsSelectOpen}
                label={selectedOperatorLabel}
                isDisabled={isDisabled}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isSelectOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingSelectRef}
                            target={selectRef}
                        >
                            <DropdownBody>
                                {operators.map((operator) => (
                                    <DropdownItem
                                        key={operator.key}
                                        option={{
                                            label: operator.label,
                                            value: operator.key,
                                        }}
                                        onClick={onOperatorSelect}
                                        shouldCloseOnSelect
                                        isDisabled={operator.isDisabled}
                                    />
                                ))}
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>

            <div className={css.childrenWrapper}>
                {children}
                {onDelete && (
                    <IconButton
                        className={css.deleteButton}
                        fillStyle="ghost"
                        intent="destructive"
                        size="medium"
                        onClick={() => onDelete()}
                        isDisabled={isDisabled}
                    >
                        clear
                    </IconButton>
                )}
            </div>
        </div>
    )
}
