import { useMemo } from 'react'

import { Box } from '@gorgias/axiom'

import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'

import ActionsPlatformTemplateConfirmation from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateConfirmation'
import ActionsPlatformTemplateInstructions from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateInstructions'
import type { ActionTemplate } from 'pages/automate/actionsPlatform/types'
import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import type { LLMPromptTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import { useTriggerConditionBuilder } from '../hooks/useTriggerConditionBuilder'
import { ActionNameField } from '../sidePanel/actionForm/ActionNameField'
import { ConditionBuilder } from '../sidePanel/actionForm/ConditionBuilder'

type Props = {
    steps: ActionTemplate[]
}

export const WizardStepSetup = ({ steps }: Props) => {
    const { visualBuilderGraph, dispatch, getVariableListForNode } =
        useVisualBuilderContext<LLMPromptTriggerNodeType>()
    const triggerNode = visualBuilderGraph.nodes[0]
    const triggerVariables = useMemo(
        () => getVariableListForNode(triggerNode.id),
        [getVariableListForNode, triggerNode.id],
    )
    const conditionBuilderProps = useTriggerConditionBuilder({
        graph: visualBuilderGraph,
        dispatch,
        triggerVariables,
    })

    return (
        <>
            <SettingsCard>
                <SettingsCardHeader>
                    <SettingsCardTitle isRequired>
                        Action name
                    </SettingsCardTitle>
                    <p>
                        Provide a clear, unique name that AI Agent will use to
                        match this action against customer requests.
                    </p>
                </SettingsCardHeader>
                <SettingsCardContent>
                    <ActionNameField
                        autoFocus
                        value={visualBuilderGraph.name}
                        onChange={(nextValue) => {
                            dispatch({ type: 'SET_NAME', name: nextValue })
                        }}
                        onBlur={() => {
                            dispatch({
                                type: 'SET_TOUCHED',
                                touched: { name: true },
                            })
                        }}
                        error={
                            visualBuilderGraph.errors?.name as
                                | string
                                | undefined
                        }
                        caption="e.g. Cancel order"
                        placeholder="Action name"
                    />
                </SettingsCardContent>
            </SettingsCard>

            <SettingsCard>
                <SettingsCardHeader>
                    <SettingsCardTitle isRequired>
                        Instructions
                    </SettingsCardTitle>
                    <p>
                        Describe what this action does and when AI Agent should
                        use it.
                    </p>
                </SettingsCardHeader>
                <SettingsCardContent>
                    <ActionsPlatformTemplateInstructions
                        error={triggerNode.data.errors?.instructions}
                        value={triggerNode.data.instructions}
                        onChange={(nextValue) => {
                            dispatch({
                                type: 'SET_LLM_PROMPT_TRIGGER_INSTRUCTIONS',
                                instructions: nextValue,
                            })
                        }}
                        onBlur={() => {
                            dispatch({
                                type: 'SET_TOUCHED',
                                nodeId: triggerNode.id,
                                touched: { instructions: true },
                            })
                        }}
                    />
                </SettingsCardContent>
            </SettingsCard>

            <SettingsCard>
                <SettingsCardHeader>
                    <SettingsCardTitle>Conditions</SettingsCardTitle>
                    <p>
                        Set conditions that must be met for this action to run.
                    </p>
                </SettingsCardHeader>
                <SettingsCardContent>
                    <Box flexDirection="column" gap="md">
                        <ConditionBuilder {...conditionBuilderProps} />
                        <ActionsPlatformTemplateConfirmation
                            steps={steps}
                            nodes={visualBuilderGraph.nodes}
                            value={triggerNode.data.requires_confirmation}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_LLM_PROMPT_TRIGGER_REQUIRES_CONFIRMATION',
                                    requiresConfirmation: nextValue,
                                })
                            }}
                        />
                    </Box>
                </SettingsCardContent>
            </SettingsCard>
        </>
    )
}
