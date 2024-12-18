import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import React, {memo, ReactNode} from 'react'
import {NodeProps} from 'reactflow'

import {useGetWorkflowConfigurationTemplate} from 'models/workflows/queries'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import useGetAppFromTemplateApp from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {
    ReusableLLMPromptCallNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import ReusableLLMPromptCallNodeLabel from './ReusableLLMPromptCallNodeLabel'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeIconContent from './VisualBuilderNodeIconContent'

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
    const {apps} = useApps()

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

    const hasInputs = !!step.inputs?.length
    const hasMissingValues =
        hasInputs && (step.inputs?.length ?? 0) !== Object.keys(values).length
    const hasAllValues =
        hasInputs && (step.inputs?.length ?? 0) === Object.keys(values).length

    const graphApp = graphApps.find((app) => {
        switch (templateApp.type) {
            case 'shopify':
            case 'recharge':
                return app.type === templateApp.type
            case 'app':
                return app.type === 'app' && app.app_id === templateApp.app_id
        }
    })

    const hasMissingCredentials =
        graphApp?.type === 'app' && !isTemplate && !graphApp.api_key?.trim()
    const hasCredentials =
        templateApp.type === 'app' && !isTemplate && !hasMissingCredentials

    const isClickable = (templateApp.type === 'app' && !isTemplate) || hasInputs

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

    let content: ReactNode = null

    if (hasMissingCredentials && hasMissingValues) {
        content = (
            <VisualBuilderNodeIconContent icon="warning" type="warning">
                Authentication and values required
            </VisualBuilderNodeIconContent>
        )
    } else if (hasMissingCredentials) {
        content = (
            <VisualBuilderNodeIconContent icon="warning" type="warning">
                Authentication required
            </VisualBuilderNodeIconContent>
        )
    } else if (hasMissingValues) {
        content = (
            <VisualBuilderNodeIconContent icon="warning" type="warning">
                Values required
            </VisualBuilderNodeIconContent>
        )
    } else if (hasCredentials && hasAllValues) {
        content = (
            <VisualBuilderNodeIconContent icon="edit">
                Edit authentication and values
            </VisualBuilderNodeIconContent>
        )
    } else if (hasCredentials) {
        content = (
            <VisualBuilderNodeIconContent icon="edit">
                Edit authentication
            </VisualBuilderNodeIconContent>
        )
    } else if (hasAllValues) {
        content = (
            <VisualBuilderNodeIconContent icon="edit">
                Edit values
            </VisualBuilderNodeIconContent>
        )
    }

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
                {content}
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
