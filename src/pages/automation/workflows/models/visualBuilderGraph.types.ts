import {Edge, Node} from 'reactflow'

import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'

import {
    MessageContent,
    WorkflowConfiguration,
    WorkflowTransition,
} from './workflowConfiguration.types'

export type TriggerButtonNodeType = Node<
    {
        // TODO remove entrypoint_label and make label* keys required once the new visual builder UI components are ready
        label?: string
        label_tkey?: string
        entrypoint_label: string
        shouldShowErrors?: boolean
        isGreyedOut?: boolean | null
    },
    'trigger_button'
>

// TODO remove once the new visual builder UI components are ready
export type AutomatedMessageNodeType = Node<
    {
        step_id: string
        message: {
            content: {
                html: string
                text: string
                attachments?: ProductCardAttachment[] | null
            }
        }
        shouldShowErrors?: Maybe<boolean>
        isGreyedOut?: Maybe<boolean>
    },
    'automated_message'
>

// TODO remove once the new visual builder UI components are ready
export type ReplyButtonNodeType = Node<
    {
        step_id: string
        choice: {
            label: string
            event_id: string
        }
        shouldShowErrors?: Maybe<boolean>
        isGreyedOut?: Maybe<boolean>
    },
    'reply_button'
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

export type AutomatedAnswerNodeType = Node<
    {
        wfConfigurationRef: {
            wfConfigurationMessagesStepId: string
        }
        content: MessageContent
        shouldShowErrors?: boolean | null
        isGreyedOut?: boolean | null
    },
    'automated_answer'
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
    | AutomatedMessageNodeType
    | ReplyButtonNodeType
    | MultipleChoicesNodeType
    | AutomatedAnswerNodeType
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
