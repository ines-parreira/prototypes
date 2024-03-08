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
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import SortableAccordionHeader from 'pages/common/components/accordion/SortableAccordionHeader'
import {useAccordionItemContext} from 'pages/common/components/accordion/AccordionItemContext'
import InputField from 'pages/common/forms/input/InputField'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import WorkflowVariablePicker from 'pages/common/draftjs/plugins/toolbar/components/WorkflowVariablePicker'
import Button from 'pages/common/components/button/Button'
import {
    WorkflowVariable,
    WorkflowVariableList,
    WorkflowVariableType,
} from 'pages/automate/workflows/models/variables.types'
import {Condition} from 'pages/common/components/Condition/Condition'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import css from './ConditionsNodeEditor.less'
import {getOperatorListByType} from './constants'
import {BooleanConditionType} from './conditions/BooleanConditionType'
import {StringConditionType} from './conditions/StringConditionType'
import {NumberConditionType} from './conditions/NumberConditionType'
import {DateConditionType} from './conditions/DateConditionType'
import {
    isIntervalOperator,
    isExistenceOperator,
    isStringOrNumberOperator,
} from './utils'

interface Props {
    name?: string
    type: 'and' | 'or'
    branchId: string
    conditions: ConditionSchema[]
    availableVariables: WorkflowVariableList
    canDeleteBranch: boolean
    shouldShowErrors: boolean
    onConditionTypeChange: (branchId: string, type: 'and' | 'or') => void
    onNameChange: (name: string) => void
    onVariableSelect: (variable: WorkflowVariable) => void
    onConditionChange: (
        condition: ConditionSchema,
        conditionIndex: number
    ) => void
    onConditionDelete: (conditionIndex: number) => void
    onDeleteBranch: () => void
}

export const ConditionsBranchItem = ({
    name,
    type,
    branchId,
    shouldShowErrors,
    onConditionTypeChange,
    onNameChange,
    onDeleteBranch,
    onVariableSelect,
    onConditionChange,
    onConditionDelete,
    availableVariables,
    conditions,
    canDeleteBranch,
}: Props) => {
    const {isExpanded} = useAccordionItemContext()

    const renderInputByType = useCallback(
        (type: WorkflowVariableType, conditionIndex: number) => {
            const condition = conditions[conditionIndex]

            if ('exists' in condition || 'doesNotExist' in condition) {
                return null
            }

            switch (type) {
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
                            shouldShowErrors={shouldShowErrors}
                            onChange={(updatedCondition) =>
                                onConditionChange(
                                    updatedCondition,
                                    conditionIndex
                                )
                            }
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
                        />
                    )
                }
            }
        },
        [conditions, onConditionChange, shouldShowErrors]
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
                        draft[nextKey] = [schema[0], '1d']
                    } else if (isExistenceOperator(nextKey)) {
                        draft[nextKey] = [schema[0]]
                    } else if (
                        isExistenceOperator(key) &&
                        isStringOrNumberOperator(nextKey)
                    ) {
                        draft[nextKey] = [schema[0], null]
                    } else if (
                        (nextKey === 'lessThan' && key !== 'greaterThan') ||
                        (nextKey === 'greaterThan' && key !== 'lessThan')
                    ) {
                        draft[nextKey] = [schema[0], null]
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

    const hasNameError = shouldShowErrors && !name

    return (
        <div className={css.container}>
            <SortableAccordionHeader>
                {isExpanded ? (
                    <InputField
                        value={name}
                        hasError={hasNameError}
                        error={hasNameError ? 'Enter a branch name' : ''}
                        className={css.input}
                        onChange={onNameChange}
                    />
                ) : (
                    <>{name}</>
                )}
            </SortableAccordionHeader>
            <AccordionBody>
                <div className={css.accordionBody}>
                    <div className={css.conditionTypeList}>
                        <PreviewRadioButton
                            className={css.conditionType}
                            label="All conditions are met"
                            value="and"
                            isSelected={type === 'and'}
                            onClick={() =>
                                onConditionTypeChange(branchId, 'and')
                            }
                        />
                        <PreviewRadioButton
                            className={css.conditionType}
                            label="At least 1 condition is met"
                            value="or"
                            isSelected={type === 'or'}
                            onClick={() =>
                                onConditionTypeChange(branchId, 'or')
                            }
                        />
                    </div>

                    <div className={css.conditionListWrapper}>
                        {!conditions.length && shouldShowErrors && (
                            <p className={css.errorMessage}>
                                A branch must have at least 1 condition
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

                            const variable = availableVariables
                                .map((vars) => {
                                    if ('variables' in vars) {
                                        return vars.variables.find(
                                            (v) => v.value === value.var
                                        )
                                    }
                                    if (vars.value === value.var) return vars
                                    return null
                                })
                                .find((v) => v?.value === value.var)

                            if (!variable) return null

                            const operators = getOperatorListByType(
                                variable.type
                            )

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
                                    >
                                        {renderInputByType(
                                            variable.type,
                                            index
                                        )}
                                    </Condition>
                                </div>
                            )
                        })}
                    </div>
                    <div className={css.cta}>
                        <WorkflowVariablePicker
                            label="Add Condition"
                            size="medium"
                            disabled={conditions.length >= 10}
                            tooltipMessage={
                                conditions.length >= 10
                                    ? `You’ve reached the maximum number of conditions
                                for this branch`
                                    : undefined
                            }
                            variableDropdownProps={{
                                noSelectedCategoryText:
                                    'use variable from previous steps',
                                dropdownPlacement: 'bottom-start',
                            }}
                            onSelect={onVariableSelect}
                        />
                        {canDeleteBranch && (
                            <Button
                                intent="destructive"
                                fillStyle="ghost"
                                onClick={onDeleteBranch}
                            >
                                <ButtonIconLabel
                                    icon="delete"
                                    iconClassName={css.deleteIcon}
                                />
                                Delete Branch
                            </Button>
                        )}
                    </div>
                </div>
            </AccordionBody>
        </div>
    )
}
