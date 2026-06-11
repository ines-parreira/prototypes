import { ActionsPlatformTemplateSteps } from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateSteps'
import type { ActionTemplate } from 'pages/automate/actionsPlatform/types'
import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import type { LLMPromptTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'

import { ActionStepList } from './ActionConfigTab/ActionStepList'

type Props = {
    steps: ActionTemplate[]
    onEditSteps: () => void
    onBuildAdvanced: () => void
}

export const WizardStepStepsList = ({
    steps,
    onEditSteps,
    onBuildAdvanced,
}: Props) => {
    const { visualBuilderGraph, dispatch } =
        useVisualBuilderContext<LLMPromptTriggerNodeType>()

    const isAdvanced = !!visualBuilderGraph.advanced_datetime

    return (
        <SettingsCard>
            <SettingsCardHeader>
                <SettingsCardTitle>Steps</SettingsCardTitle>
                <p>
                    Add one or more steps with your 3rd party apps. Steps will
                    be performed in the order below.
                </p>
            </SettingsCardHeader>
            <SettingsCardContent>
                {isAdvanced ? (
                    <ActionsPlatformTemplateSteps
                        error={
                            visualBuilderGraph.errors?.nodes as
                                | string
                                | undefined
                        }
                        onEditSteps={onEditSteps}
                    />
                ) : (
                    <ActionStepList
                        graph={visualBuilderGraph}
                        dispatch={dispatch}
                        steps={steps}
                        onBuildAdvanced={onBuildAdvanced}
                    />
                )}
            </SettingsCardContent>
        </SettingsCard>
    )
}
