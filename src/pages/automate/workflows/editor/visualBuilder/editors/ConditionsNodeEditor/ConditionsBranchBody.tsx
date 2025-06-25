import React, { useCallback } from 'react'

import {
    BooleanSchema,
    ConditionKey,
    ConditionSchema,
    DateSchema,
    DoesNotExistSchema,
    ExistsSchema,
    NumberSchema,
    StringSchema,
    VarSchema,
} from 'pages/automate/workflows/models/conditions.types'
import { findVariable } from 'pages/automate/workflows/models/variables.model'
import {
    WorkflowVariable,
    WorkflowVariableList,
} from 'pages/automate/workflows/models/variables.types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import { Condition } from 'pages/common/components/Condition/Condition'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import { PreviewRadioButton } from 'pages/common/components/PreviewRadioButton'
import WorkflowVariableDropdown from 'pages/common/draftjs/plugins/toolbar/components/WorkflowVariableDropdown'
import WorkflowVariablePicker from 'pages/common/draftjs/plugins/toolbar/components/WorkflowVariablePicker'

import { BooleanConditionType } from './conditions/BooleanConditionType'
import { DateConditionType } from './conditions/DateConditionType'
import { NumberConditionType } from './conditions/NumberConditionType'
import { StringConditionType } from './conditions/StringConditionType'
import { getOperatorListByVariable } from './constants'
import { handleOperatorSelectLogic } from './handleOperatorSelectLogic'

import css from './ConditionsNodeEditor.less'

interface Props {
    type: 'and' | 'or' | null
    branchId: string
    conditions: ConditionSchema[]
    availableVariables: WorkflowVariableList
    canDeleteBranch: boolean
    showNoneOption?: boolean
    hasMultipleChildren: boolean
    maxConditionsTooltipMessage: string
    onConditionTypeChange: (branchId: string, type: 'and' | 'or' | null) => void
    onVariableSelect: (variable: WorkflowVariable) => void
    onConditionChange: (
        condition: ConditionSchema,
        conditionIndex: number,
    ) => void
    onConditionDelete: (conditionIndex: number) => void
    onDeleteBranch: () => void
    variableDropdownProps?: Partial<
        React.ComponentProps<typeof WorkflowVariableDropdown>
    >
    variablePickerTooltipMessage?: string | null
    isDisabled?: boolean
    errors?: string | Record<string, string>
    onConditionBlur?: (conditionIndex: number) => void
}

export const ConditionsBranchBody = ({
    type,
    branchId,
    onConditionTypeChange,
    onDeleteBranch,
    onVariableSelect,
    onConditionChange,
    onConditionDelete,
    hasMultipleChildren,
    availableVariables,
    conditions,
    canDeleteBranch,
    showNoneOption,
    maxConditionsTooltipMessage,
    variableDropdownProps,
    variablePickerTooltipMessage,
    isDisabled,
    errors,
    onConditionBlur,
}: Props) => {
    const renderInput = useCallback(
        (variable: WorkflowVariable, conditionIndex: number) => {
            const condition = conditions[conditionIndex]

            if ('exists' in condition || 'doesNotExist' in condition) {
                return null
            }

            const error =
                typeof errors === 'object'
                    ? errors?.[conditionIndex]
                    : undefined

            switch (variable.type) {
                case 'boolean': {
                    const condition = conditions[conditionIndex] as Exclude<
                        BooleanSchema,
                        ExistsSchema | DoesNotExistSchema
                    >
                    return (
                        <BooleanConditionType
                            condition={condition}
                            onChange={(updatedCondition) =>
                                onConditionChange(
                                    updatedCondition,
                                    conditionIndex,
                                )
                            }
                            isDisabled={isDisabled}
                        />
                    )
                }
                case 'string': {
                    const condition = conditions[conditionIndex] as Exclude<
                        StringSchema,
                        ExistsSchema | DoesNotExistSchema
                    >

                    return (
                        <StringConditionType
                            condition={condition}
                            onChange={(updatedCondition) =>
                                onConditionChange(
                                    updatedCondition,
                                    conditionIndex,
                                )
                            }
                            isDisabled={isDisabled}
                            options={variable.options}
                            error={error}
                            onBlur={() => {
                                onConditionBlur?.(conditionIndex)
                            }}
                        />
                    )
                }
                case 'number': {
                    const condition = conditions[conditionIndex] as Exclude<
                        NumberSchema,
                        ExistsSchema | DoesNotExistSchema
                    >
                    return (
                        <NumberConditionType
                            condition={condition}
                            format={variable.format}
                            onChange={(updatedCondition) =>
                                onConditionChange(
                                    updatedCondition,
                                    conditionIndex,
                                )
                            }
                            isDisabled={isDisabled}
                            error={error}
                            onBlur={() => {
                                onConditionBlur?.(conditionIndex)
                            }}
                        />
                    )
                }
                case 'date': {
                    const condition = conditions[conditionIndex] as Exclude<
                        DateSchema,
                        ExistsSchema | DoesNotExistSchema
                    >
                    return (
                        <DateConditionType
                            condition={condition}
                            onChange={(updatedCondition) =>
                                onConditionChange(
                                    updatedCondition,
                                    conditionIndex,
                                )
                            }
                            isDisabled={isDisabled}
                            error={error}
                            onBlur={() => {
                                onConditionBlur?.(conditionIndex)
                            }}
                        />
                    )
                }
            }
        },
        [conditions, onConditionChange, isDisabled, errors, onConditionBlur],
    )

    const handleOperatorSelect = useCallback(
        (
            condition: ConditionSchema,
            index: number,
            variable: WorkflowVariable,
        ) =>
            (nextValue: string) => {
                const updated = handleOperatorSelectLogic(
                    condition,
                    nextValue as ConditionKey,
                    variable,
                )
                onConditionChange(updated, index)
            },
        [onConditionChange],
    )

    return (
        <div className={css.accordionBody}>
            <div className={css.conditionTypeList}>
                {showNoneOption && (
                    <PreviewRadioButton
                        className={css.conditionType}
                        label="No conditions required"
                        value="none"
                        isSelected={type === null}
                        onClick={() => onConditionTypeChange(branchId, null)}
                        isDisabled={isDisabled}
                    />
                )}
                <PreviewRadioButton
                    className={css.conditionType}
                    label="All conditions are met"
                    value="and"
                    isSelected={type === 'and'}
                    onClick={() => onConditionTypeChange(branchId, 'and')}
                    isDisabled={isDisabled}
                />
                <PreviewRadioButton
                    className={css.conditionType}
                    label="At least 1 condition met"
                    value="or"
                    isSelected={type === 'or'}
                    onClick={() => onConditionTypeChange(branchId, 'or')}
                    isDisabled={isDisabled}
                />
            </div>

            {type && (
                <>
                    {conditions.length > 0 && (
                        <div className={css.conditionListWrapper}>
                            {conditions.map((condition, index) => {
                                const operator = Object.keys(
                                    condition,
                                )[0] as ConditionKey
                                const value = (
                                    condition as unknown as Record<
                                        ConditionKey,
                                        [VarSchema]
                                    >
                                )[operator][0]

                                const variable = findVariable(
                                    availableVariables,
                                    (variable) => {
                                        if (
                                            'value' in variable &&
                                            variable.value === value.var
                                        ) {
                                            return variable
                                        }
                                    },
                                )

                                if (!variable) return null
                                if (!type) return null

                                const operators =
                                    getOperatorListByVariable(variable)

                                return (
                                    <div
                                        className={css.conditionList}
                                        key={`${variable.name}_${index}`}
                                    >
                                        <Condition
                                            label={variable.name}
                                            isFirst={index === 0}
                                            type={type}
                                            onDelete={() =>
                                                onConditionDelete(index)
                                            }
                                            selectedOperatorValue={
                                                Object.keys(condition)[0]
                                            }
                                            operators={operators}
                                            onOperatorSelect={handleOperatorSelect(
                                                condition,
                                                index,
                                                variable,
                                            )}
                                            isDisabled={isDisabled}
                                            icon={
                                                variable.nodeType ===
                                                'order_shipmonk'
                                                    ? variable.icon
                                                    : undefined
                                            }
                                        >
                                            {renderInput(variable, index)}
                                        </Condition>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    <div className={css.cta}>
                        <WorkflowVariablePicker
                            label="Add Condition"
                            size="medium"
                            disabled={isDisabled || conditions.length >= 10}
                            tooltipMessage={
                                conditions.length >= 10
                                    ? maxConditionsTooltipMessage
                                    : variablePickerTooltipMessage
                            }
                            variableDropdownProps={variableDropdownProps}
                            onSelect={onVariableSelect}
                        />
                        {canDeleteBranch && (
                            <ConfirmationPopover
                                buttonProps={{ intent: 'destructive' }}
                                cancelButtonProps={{ intent: 'secondary' }}
                                content="Deleting this branch wil also delete any steps added below and cannot be undone."
                                title={<b>Delete branch and children?</b>}
                                onConfirm={onDeleteBranch}
                                confirmLabel="Delete"
                                showCancelButton
                            >
                                {({ uid, onDisplayConfirmation }) => (
                                    <Button
                                        id={uid}
                                        intent="destructive"
                                        fillStyle="ghost"
                                        onClick={
                                            hasMultipleChildren
                                                ? onDisplayConfirmation
                                                : onDeleteBranch
                                        }
                                    >
                                        <ButtonIconLabel
                                            icon="delete"
                                            iconClassName={css.deleteIcon}
                                        />
                                        Delete Branch
                                    </Button>
                                )}
                            </ConfirmationPopover>
                        )}
                    </div>
                </>
            )}

            {typeof errors === 'string' && (
                <div className={css.error}>{errors}</div>
            )}
        </div>
    )
}
