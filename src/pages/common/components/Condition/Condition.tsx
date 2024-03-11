import React, {useRef, useState} from 'react'

import IconButton from 'pages/common/components/button/IconButton'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import Button from 'pages/common/components/button/Button'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Dropdown from 'pages/common/components/dropdown/Dropdown'

import css from './Condition.less'

type Operator = {
    label: string
    key: string
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
}: ConditionProps) => {
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const selectRef = useRef<HTMLDivElement>(null)
    const floatingSelectRef = useRef<HTMLDivElement>(null)

    const selectedOperatorLabel = operators.find(
        (operator) => operator.key === selectedOperatorValue
    )?.label

    return (
        <div className={css.container}>
            {!isFirst && (
                <Button intent="destructive" className={css.type}>
                    {type.toUpperCase()}
                </Button>
            )}
            <div className={css.labelWrapper}>
                <span className={css.label}>{label}</span>
            </div>

            <SelectInputBox
                className={css.selectInput}
                ref={selectRef}
                floating={floatingSelectRef}
                onToggle={setIsSelectOpen}
                label={selectedOperatorLabel}
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
                    >
                        clear
                    </IconButton>
                )}
            </div>
        </div>
    )
}
