import React from 'react'
import {Label} from '@gorgias/ui-kit'

import {ConditionsBranchBody} from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/ConditionsBranchBody'
import {buildConditionSchemaByVariableType} from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/utils'
import {WorkflowVariableGroup} from 'pages/automate/workflows/models/variables.types'
import {ConditionSchema} from 'pages/automate/workflows/models/conditions.types'

import css from './CustomActionsForm.less'

type Props = {
    conditions: ConditionSchema[]
    conditionsType: 'and' | 'or' | null
    onConditionDelete: (index: number) => void
    onVariableSelect: (condition: ConditionSchema) => void
    onConditionTypeChange: (type: 'and' | 'or' | null) => void
    inputVariables: WorkflowVariableGroup[]
    onConditionChange: (condition: ConditionSchema, index: number) => void
}

export default function ActionFormInputConditions({
    conditions,
    conditionsType,
    inputVariables,
    onConditionChange,
    onConditionDelete,
    onConditionTypeChange,
    onVariableSelect,
}: Props) {
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
                type={conditionsType}
                conditions={conditions}
                onDeleteBranch={() => {}}
                onConditionDelete={onConditionDelete}
                onVariableSelect={(variable) => {
                    const newCondition = buildConditionSchemaByVariableType(
                        variable.type,
                        variable.value
                    )
                    onVariableSelect(newCondition)
                }}
                onConditionTypeChange={(_branchId, type) =>
                    onConditionTypeChange(type)
                }
                onConditionChange={onConditionChange}
            />
        </div>
    )
}
