import {Edge, Node} from 'reactflow'

import {
    MessageContent,
    WorkflowConfiguration,
    WorkflowTransition,
} from './workflowConfiguration.types'

export type TriggerButtonNodeType = Node<
    {
        label: string
        label_tkey: string
        shouldShowErrors?: boolean
        isGreyedOut?: boolean | null
    },
    'trigger_button'
>

export type MultipleChoicesNodeType = Node<
    {
        wfConfigurationRef: {
            wfConfigurationChoicesStepId: string
            wfConfigurationMessagesStepId: string
        }
        content: MessageContent
        choices: Array<{
            event_id: string
            label: string
            label_tkey?: string
        }>
        shouldShowErrors?: boolean | null
        isGreyedOut?: boolean | null
    },
    'multiple_choices'
>

export type AutomatedMessageNodeType = Node<
    {
        wfConfigurationRef: {
            wfConfigurationMessagesStepId: string
        }
        content: MessageContent
        shouldShowErrors?: boolean | null
        isGreyedOut?: boolean | null
    },
    'automated_message'
>

export type EndNodeType = Node<
    {
        wfConfigurationRef: {
            wfConfigurationWorkflowCallStepId: string
        }
        shouldShowErrors?: boolean | null
        isGreyedOut?: boolean | null
    },
    'end'
>

export type VisualBuilderNode =
    | TriggerButtonNodeType
    | MultipleChoicesNodeType
    | AutomatedMessageNodeType
    | EndNodeType

export type VisualBuilderEdge = Edge<{
    event?: WorkflowTransition['event'] | null
}>

export type VisualBuilderGraph = {
    name: string
    nodes: VisualBuilderNode[]
    edges: VisualBuilderEdge[]
    wfConfigurationOriginal: WorkflowConfiguration
}
