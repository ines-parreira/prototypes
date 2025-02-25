import React from 'react'

import { ConditionSchema } from 'pages/automate/workflows/models/conditions.types'
import {
    WorkflowVariable,
    WorkflowVariableList,
} from 'pages/automate/workflows/models/variables.types'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import { useAccordionItemContext } from 'pages/common/components/accordion/AccordionItemContext'
import SortableAccordionHeader from 'pages/common/components/accordion/SortableAccordionHeader'
import InputField from 'pages/common/forms/input/InputField'

import { ConditionsBranchBody } from './ConditionsBranchBody'

import css from './ConditionsNodeEditor.less'

interface Props {
    name?: string
    type: 'and' | 'or' | null
    branchId: string
    conditions: ConditionSchema[]
    availableVariables: WorkflowVariableList
    canDeleteBranch: boolean
    showNoneOption?: boolean
    hasMultipleChildren: boolean
    onConditionTypeChange: (branchId: string, type: 'and' | 'or' | null) => void
    onNameChange: (name: string) => void
    onVariableSelect: (variable: WorkflowVariable) => void
    onConditionChange: (
        condition: ConditionSchema,
        conditionIndex: number,
    ) => void
    onConditionDelete: (conditionIndex: number) => void
    onDeleteBranch: () => void
    errors?: {
        name?: string
        conditions?: string | Record<string, string>
    }
    onNameBlur?: () => void
    onConditionBlur?: (index: number) => void
}

export const ConditionsBranchItem = ({
    name,
    onNameChange,
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
    errors,
    onNameBlur,
    onConditionBlur,
}: Props) => {
    const { isExpanded } = useAccordionItemContext()

    return (
        <div className={css.container}>
            <SortableAccordionHeader>
                {isExpanded ? (
                    <InputField
                        value={name}
                        error={errors?.name}
                        className={css.input}
                        onChange={onNameChange}
                        onBlur={onNameBlur}
                    />
                ) : (
                    <>{name}</>
                )}
            </SortableAccordionHeader>
            <AccordionBody>
                <ConditionsBranchBody
                    maxConditionsTooltipMessage="You’ve reached the maximum number of conditions for this branch"
                    variableDropdownProps={{
                        noSelectedCategoryText:
                            'use variable from previous steps',
                        dropdownPlacement: 'bottom-start',
                    }}
                    availableVariables={availableVariables}
                    branchId={branchId}
                    canDeleteBranch={canDeleteBranch}
                    conditions={conditions}
                    hasMultipleChildren={hasMultipleChildren}
                    onConditionChange={onConditionChange}
                    onConditionDelete={onConditionDelete}
                    onConditionTypeChange={onConditionTypeChange}
                    onDeleteBranch={onDeleteBranch}
                    onVariableSelect={onVariableSelect}
                    type={type}
                    showNoneOption={showNoneOption}
                    errors={errors?.conditions}
                    onConditionBlur={onConditionBlur}
                />
            </AccordionBody>
        </div>
    )
}
