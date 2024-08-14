import React, {useCallback} from 'react'
import {Label} from '@gorgias/ui-kit'

import {useController, useFieldArray, useFormContext} from 'react-hook-form'
import {ConditionsBranchBody} from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/ConditionsBranchBody'
import {buildConditionSchemaByVariableType} from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/utils'
import {
    WorkflowVariable,
    WorkflowVariableGroup,
} from 'pages/automate/workflows/models/variables.types'
import {
    ConditionSchema,
    VarSchema,
} from 'pages/automate/workflows/models/conditions.types'

import {
    fulfillmentStatus,
    orderStatus,
    paymentStatus,
    shipmentStatus,
} from '../utils'
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
                if (!conditionsType) return true
                const conditionsValues = conditions.map(
                    (condition) =>
                        (
                            Object.values(condition)[0] as [
                                VarSchema,
                                string | null | undefined | boolean
                            ]
                        )[1]
                )
                for (const value of conditionsValues) {
                    if (value === null) return false
                    if (typeof value === 'string' && value.trim().length === 0)
                        return false
                }
            },
        },
    })

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
                type={conditionsType.value}
                conditions={getValues('conditions')}
                onDeleteBranch={() => {}}
                renderCustomConditionError={handleRenderCustomConditionError}
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
