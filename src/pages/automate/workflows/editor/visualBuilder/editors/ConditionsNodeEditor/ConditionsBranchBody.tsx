import React, {useCallback} from 'react'
import {produce} from 'immer'

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
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import WorkflowVariablePicker from 'pages/common/draftjs/plugins/toolbar/components/WorkflowVariablePicker'
import Button from 'pages/common/components/button/Button'
import {
    WorkflowVariable,
    WorkflowVariableList,
} from 'pages/automate/workflows/models/variables.types'
import {Condition} from 'pages/common/components/Condition/Condition'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import WorkflowVariableDropdown from 'pages/common/draftjs/plugins/toolbar/components/WorkflowVariableDropdown'
import {findVariable} from 'pages/automate/workflows/models/variables.model'

import {getOperatorListByVariable} from './constants'
import {BooleanConditionType} from './conditions/BooleanConditionType'
import {StringConditionType} from './conditions/StringConditionType'
import {NumberConditionType} from './conditions/NumberConditionType'
import {DateConditionType} from './conditions/DateConditionType'
import {
    isIntervalOperator,
    isExistenceOperator,
    isStringOrNumberOperator,
} from './utils'

import css from './ConditionsNodeEditor.less'

interface Props {
    type: 'and' | 'or' | null
    branchId: string
    conditions: ConditionSchema[]
    availableVariables: WorkflowVariableList
    canDeleteBranch: boolean
    shouldShowErrors: boolean
    showNoneOption?: boolean
    hasMultipleChildren: boolean
    maxConditionsTooltipMessage: string
    onConditionTypeChange: (branchId: string, type: 'and' | 'or' | null) => void
    onVariableSelect: (variable: WorkflowVariable) => void
    onConditionChange: (
        condition: ConditionSchema,
        conditionIndex: number
    ) => void
    onConditionDelete: (conditionIndex: number) => void
    onDeleteBranch: () => void
    variableDropdownProps?: Partial<
        React.ComponentProps<typeof WorkflowVariableDropdown>
    >
    emptyBranchErrorMessage?: string
    variablePickerTooltipMessage?: string | null
    isDisabled?: boolean
}

export const ConditionsBranchBody = ({
    type,
    branchId,
    shouldShowErrors,
    emptyBranchErrorMessage,
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
}: Props) => {
    const renderInput = useCallback(
        (variable: WorkflowVariable, conditionIndex: number) => {
            const condition = conditions[conditionIndex]

            if ('exists' in condition || 'doesNotExist' in condition) {
                return null
            }

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
                                    conditionIndex
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
                            shouldShowErrors={shouldShowErrors}
                            onChange={(updatedCondition) =>
                                onConditionChange(
                                    updatedCondition,
                                    conditionIndex
                                )
                            }
                            isDisabled={isDisabled}
                            options={variable.options}
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
                            shouldShowErrors={shouldShowErrors}
                            onChange={(updatedCondition) =>
                                onConditionChange(
                                    updatedCondition,
                                    conditionIndex
                                )
                            }
                            isDisabled={isDisabled}
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
                                    conditionIndex
                                )
                            }
                            isDisabled={isDisabled}
                        />
                    )
                }
            }
        },
        [conditions, onConditionChange, shouldShowErrors, isDisabled]
    )

    const handleOperatorSelect = useCallback(
        (condition: ConditionSchema, index: number) => (nextValue: string) => {
            const nextKey = nextValue as AllKeys<typeof condition>
            const key = Object.keys(condition)[0] as AllKeys<typeof condition>

            if (nextKey === key) return

            onConditionChange(
                produce(condition, (draft) => {
                    const schema = draft[key]

                    if (!schema) {
                        return
                    }

                    if (
                        isIntervalOperator(nextKey) &&
                        key !== 'lessThanInterval' &&
                        key !== 'greaterThanInterval'
                    ) {
                        draft[nextKey] = [schema[0], '-1d']
                    } else if (isExistenceOperator(nextKey)) {
                        draft[nextKey] = [schema[0]]
                    } else if (
                        isExistenceOperator(key) &&
                        isStringOrNumberOperator(nextKey)
                    ) {
                        draft[nextKey] = [schema[0], undefined]
                    } else if (
                        (nextKey === 'lessThan' && key !== 'greaterThan') ||
                        (nextKey === 'greaterThan' && key !== 'lessThan')
                    ) {
                        draft[nextKey] = [schema[0], undefined]
                    } else {
                        // @ts-expect-error
                        draft[nextKey] = draft[key]
                    }

                    delete draft[key]
                }),
                index
            )
        },
        [onConditionChange]
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
                    <div className={css.conditionListWrapper}>
                        {emptyBranchErrorMessage &&
                            !conditions.length &&
                            shouldShowErrors && (
                                <p className={css.errorMessage}>
                                    {emptyBranchErrorMessage}
                                </p>
                            )}
                        {conditions.map((condition, index) => {
                            const operator = Object.keys(
                                condition
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
                                }
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
                                            index
                                        )}
                                        isDisabled={isDisabled}
                                    >
                                        {renderInput(variable, index)}
                                    </Condition>
                                </div>
                            )
                        })}
                    </div>
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
                                buttonProps={{intent: 'destructive'}}
                                cancelButtonProps={{intent: 'secondary'}}
                                content="Deleting this branch wil also delete any steps added below and cannot be undone."
                                title={<b>Delete branch and children?</b>}
                                onConfirm={onDeleteBranch}
                                confirmLabel="Delete"
                                showCancelButton
                            >
                                {({uid, onDisplayConfirmation}) => (
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
        </div>
    )
}
