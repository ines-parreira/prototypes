import _noop from 'lodash/noop'

import { Label } from '@gorgias/merchant-ui-kit'

import { ConditionsBranchBody } from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/ConditionsBranchBody'
import { buildConditionSchemaByVariableType } from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/utils'
import { ConditionSchema } from 'pages/automate/workflows/models/conditions.types'
import { WorkflowVariableList } from 'pages/automate/workflows/models/variables.types'
import { LLMPromptTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Alert from 'pages/common/components/Alert/Alert'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'

import css from './ActionsPlatformTemplateConditions.less'

type Props = {
    type: LLMPromptTriggerNodeType['data']['conditionsType']
    conditions: LLMPromptTriggerNodeType['data']['conditions']
    onConditionDelete: (index: number) => void
    onConditionAdd: (condition: ConditionSchema) => void
    onConditionTypeChange: (
        type: LLMPromptTriggerNodeType['data']['conditionsType'],
    ) => void
    onConditionChange: (condition: ConditionSchema, index: number) => void
    onConditionBlur?: (index: number) => void
    errors?: string | Record<string, string>
    variables: WorkflowVariableList
    isRecommendationAlertOpen?: boolean
    onRecommendationAlertClose?: () => void
}

const ActionsPlatformTemplateConditions = ({
    type,
    conditions,
    onConditionDelete,
    onConditionAdd,
    onConditionTypeChange,
    onConditionChange,
    onConditionBlur,
    errors,
    variables,
    isRecommendationAlertOpen,
    onRecommendationAlertClose,
}: Props) => {
    return (
        <div className={css.container}>
            <Label>Action conditions</Label>
            {isRecommendationAlertOpen && (
                <Alert onClose={onRecommendationAlertClose}>
                    We recommend the conditions below to ensure this Action
                    works properly.
                </Alert>
            )}
            <ToolbarProvider workflowVariables={variables}>
                <ConditionsBranchBody
                    maxConditionsTooltipMessage="You’ve reached the maximum number of conditions for this Action"
                    variableDropdownProps={{
                        noSelectedCategoryText: 'INSERT variable',
                        dropdownPlacement: 'bottom-start',
                    }}
                    variablePickerTooltipMessage={null}
                    hasMultipleChildren
                    canDeleteBranch={false}
                    branchId={''}
                    availableVariables={variables}
                    showNoneOption
                    type={type}
                    conditions={conditions}
                    onDeleteBranch={_noop}
                    onConditionDelete={onConditionDelete}
                    onVariableSelect={(variable) => {
                        const condition = buildConditionSchemaByVariableType(
                            variable.type,
                            variable.value,
                        )

                        onConditionAdd(condition)
                    }}
                    onConditionTypeChange={(_branchId, type) => {
                        onConditionTypeChange(type)
                    }}
                    onConditionChange={onConditionChange}
                    onConditionBlur={onConditionBlur}
                    errors={errors}
                />
            </ToolbarProvider>
        </div>
    )
}

export default ActionsPlatformTemplateConditions
