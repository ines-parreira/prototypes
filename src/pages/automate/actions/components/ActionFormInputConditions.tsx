import React from 'react'
import {Label} from '@gorgias/ui-kit'

import {useController, useFieldArray, useFormContext} from 'react-hook-form'
import {ConditionsBranchBody} from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/ConditionsBranchBody'
import {buildConditionSchemaByVariableType} from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/utils'
import {WorkflowVariableGroup} from 'pages/automate/workflows/models/variables.types'
import {ConditionSchema} from 'pages/automate/workflows/models/conditions.types'

import {ConditionsFormValues} from '../types'
import css from './CustomActionsForm.less'

type Props = {
    inputVariables: WorkflowVariableGroup[]
}

export default function ActionFormInputConditions({inputVariables}: Props) {
    const {control, getValues} = useFormContext<ConditionsFormValues>()
    const {field: conditionsType} = useController({
        control,
        name: 'conditionsType',
    })

    const {remove, update, append} = useFieldArray({
        control,
        name: 'conditions',
        rules: {
            validate: (conditions: ConditionSchema[], {conditionsType}) => {
                if (!conditionsType) {
                    return true
                }

                if (!conditions.length) {
                    return false
                }

                return !conditions.some((condition) => {
                    const key = Object.keys(condition)[0] as AllKeys<
                        typeof condition
                    >
                    const schema = condition[key]

                    if (!schema) {
                        return false
                    }

                    if (key === 'exists' || key === 'doesNotExist') {
                        return false
                    }

                    return typeof schema[1] === 'undefined'
                })
            },
        },
    })

    return (
        <div className={css.formItem}>
            <Label>
                Action can only be performed according to the following
                conditions
            </Label>

            <ConditionsBranchBody
                maxConditionsTooltipMessage="You’ve reached the maximum number of conditions for this action"
                variableDropdownProps={{
                    noSelectedCategoryText: 'INSERT variable',
                    dropdownPlacement: 'bottom-start',
                }}
                variablePickerTooltipMessage={null}
                hasMultipleChildren={true}
                canDeleteBranch={false}
                branchId={''}
                availableVariables={inputVariables}
                showNoneOption={true}
                shouldShowErrors={true}
                type={conditionsType.value}
                conditions={getValues('conditions')}
                onDeleteBranch={() => {}}
                onConditionDelete={(index) => {
                    remove(index)
                    conditionsType.onChange(conditionsType.value)
                }}
                onVariableSelect={(variable) => {
                    const newCondition = buildConditionSchemaByVariableType(
                        variable.type,
                        variable.value
                    )
                    append(newCondition)
                    conditionsType.onChange(conditionsType.value)
                }}
                onConditionTypeChange={(_branchId, type) => {
                    conditionsType.onChange(type, {
                        shouldDirty: true,
                    })
                }}
                onConditionChange={(condition, index) => {
                    update(index, condition)
                    conditionsType.onChange(conditionsType.value)
                }}
            />
        </div>
    )
}
