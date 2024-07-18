import React, {useCallback} from 'react'
import {Label} from '@gorgias/ui-kit'

import {ConditionsBranchBody} from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/ConditionsBranchBody'
import {buildConditionSchemaByVariableType} from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/utils'
import {
    WorkflowVariable,
    WorkflowVariableGroup,
} from 'pages/automate/workflows/models/variables.types'
import {ConditionSchema} from 'pages/automate/workflows/models/conditions.types'

import {
    fulfillmentStatus,
    orderStatus,
    paymentStatus,
    shipmentStatus,
} from '../utils'
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
    // Works only for string conditions.
    // To add more types, refer to /ConditionsBranchBody -> renderInput method.
    const handleRenderCustomConditionError = useCallback(
        (
            _: ConditionSchema,
            variable: WorkflowVariable
        ): React.ReactNode | undefined => {
            const STATUS_ERROR_VARIABLES = [
                fulfillmentStatus,
                orderStatus,
                shipmentStatus,
                paymentStatus,
            ]

            if (STATUS_ERROR_VARIABLES.includes(variable)) {
                return (
                    <span>
                        Enter a value.{' '}
                        <a
                            href="https://link.gorgias.com/cys"
                            target="_blank"
                            rel="noreferrer"
                        >
                            See possible values to use.
                        </a>
                    </span>
                )
            }
        },
        []
    )
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
                renderCustomConditionError={handleRenderCustomConditionError}
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
