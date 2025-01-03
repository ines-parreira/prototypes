import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import React, {memo} from 'react'
import {NodeProps} from 'reactflow'

import {useGetWorkflowConfigurationTemplate} from 'models/workflows/queries'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import useGetAppFromTemplateApp from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'
import {
    getActionsAppFromTemplateApp,
    getGraphAppFromTemplateApp,
} from 'pages/automate/actionsPlatform/utils'
import ReusableLLMPromptCallNodeStatusLabel from 'pages/automate/workflows/components/ReusableLLMPromptCallNodeStatusLabel'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {getReusableLLMPromptCallNodeStatuses} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {
    ReusableLLMPromptCallNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import ReusableLLMPromptCallNodeLabel from './ReusableLLMPromptCallNodeLabel'
import VisualBuilderNode from './VisualBuilderNode'

type Props = VisualBuilderNodeProps & {
    configurationId: string
    values: ReusableLLMPromptCallNodeType['data']['values']
    apps: NonNullable<VisualBuilderGraph['apps']>
    isTemplate: boolean
}

const ReusableLLMPromptCallNode = memo(function ReusableLLMPromptCallNode({
    configurationId,
    isSelected,
    isGreyedOut,
    edgeProps,
    deleteProps,
    values,
    apps: graphApps,
    isTemplate,
}: Props) {
    const {data: step} = useGetWorkflowConfigurationTemplate(configurationId)
    const {apps, actionsApps} = useApps()

    const getAppFromTemplateApp = useGetAppFromTemplateApp({apps})

    if (!step) {
        return (
            <div>
                <EdgeBlock {...edgeProps} />
                <VisualBuilderNode
                    isClickable={false}
                    isSelected={isSelected}
                    isGreyedOut={isGreyedOut}
                >
                    <LoadingSpinner size="medium" />
                </VisualBuilderNode>
            </div>
        )
    }

    const templateApp = step.apps[0]
    const app = getAppFromTemplateApp(templateApp)

    if (!app) {
        return (
            <div>
                <EdgeBlock {...edgeProps} />
                <VisualBuilderNode
                    isClickable={false}
                    isSelected={isSelected}
                    isGreyedOut={isGreyedOut}
                >
                    <LoadingSpinner size="medium" />
                </VisualBuilderNode>
            </div>
        )
    }

    const graphApp = getGraphAppFromTemplateApp(graphApps, templateApp)
    const actionsApp = getActionsAppFromTemplateApp(actionsApps, templateApp)

    const {
        isClickable,
        hasMissingCredentials,
        hasCredentials,
        hasAllValues,
        hasMissingValues,
    } = getReusableLLMPromptCallNodeStatuses({
        graphApp,
        actionsApp,
        step,
        values,
        templateApp,
        isTemplate,
    })

    return (
        <div>
            <EdgeBlock {...edgeProps} />
            <VisualBuilderNode
                isClickable={isClickable}
                isSelected={isSelected}
                isGreyedOut={isGreyedOut}
                isErrored={!!graphApp?.errors}
            >
                <ReusableLLMPromptCallNodeLabel app={app} name={step.name} />
                <ReusableLLMPromptCallNodeStatusLabel
                    hasMissingCredentials={hasMissingCredentials}
                    hasCredentials={hasCredentials}
                    hasAllValues={hasAllValues}
                    hasMissingValues={hasMissingValues}
                />
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function ReusableLLMPromptCallNodeWrapper(
    node: NodeProps<ReusableLLMPromptCallNodeType['data']>
) {
    const {visualBuilderGraph} = useVisualBuilderContext()

    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <ReusableLLMPromptCallNode
            {...commonProps}
            configurationId={node.data.configuration_id}
            values={node.data.values}
            apps={visualBuilderGraph.apps ?? []}
            isTemplate={visualBuilderGraph.isTemplate}
        />
    )
}
