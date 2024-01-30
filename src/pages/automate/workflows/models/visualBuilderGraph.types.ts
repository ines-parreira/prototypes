import {Edge, Node} from 'reactflow'

import {
    LanguageCode,
    MessageContent,
    WorkflowConfiguration,
    WorkflowTransition,
} from './workflowConfiguration.types'

export type TriggerButtonNodeType = Node<
    {
        label: string
        label_tkey: string
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
        isGreyedOut?: boolean | null
    },
    'multiple_choices'
>

export function isMultipleChoicesNodeType(
    node: VisualBuilderNode
): node is MultipleChoicesNodeType {
    return node.type === 'multiple_choices'
}

export type AutomatedMessageNodeType = Node<
    {
        wfConfigurationRef: {
            wfConfigurationMessagesStepId: string
        }
        content: MessageContent
        isGreyedOut?: boolean | null
    },
    'automated_message'
>

export type TextReplyNodeType = Node<
    {
        wfConfigurationRef: {
            wfConfigurationMessagesStepId: string
            wfConfigurationTextInputStepId: string
        }
        content: MessageContent
        isGreyedOut?: boolean | null
    },
    'text_reply'
>

export type FileUploadNodeType = Node<
    {
        wfConfigurationRef: {
            wfConfigurationMessagesStepId: string
            wfConfigurationAttachmentsInputStepId: string
        }
        content: MessageContent
        isGreyedOut?: boolean | null
    },
    'file_upload'
>

export type OrderSelectionNodeType = Node<
    {
        wfConfigurationRef: {
            wfConfigurationMessagesStepId: string
            wfConfigurationShopperAuthenticationStepId: string
            wfConfigurationOrderSelectionWorkflowCallStepId: string
            wfConfigurationNoOrdersWorkflowCallStepId: string
        }
        content: MessageContent
        integrationId: number
        isGreyedOut?: boolean | null
    },
    'order_selection'
>

export type HttpRequestNodeType = Node<
    {
        wfConfigurationRef: {
            wfConfigurationHttpRequestStepId: string
        }
        name: string
        url: string
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
        headers: {name: string; value: string}[]
        json?: string
        formUrlencoded?: {key: string; value: string}[]
        bodyContentType?:
            | 'application/json'
            | 'application/x-www-form-urlencoded'
        variables: {
            id: string
            name: string
            jsonpath: string
        }[]
        testRequestResult?: {
            status: number
            content?: string
        }
        isGreyedOut?: boolean | null
    },
    'http_request'
>

export type ShopperAuthenticationNodeType = Node<
    {
        wfConfigurationRef: {
            wfConfigurationShopperAuthenticationStepId: string
        }
        integrationId: number
        isGreyedOut?: boolean | null
    },
    'shopper_authentication'
>

export type EndNodeType = Node<
    {
        wfConfigurationRef: {
            wfConfigurationWorkflowCallOrHandoverStepId: string
        }
        withWasThisHelpfulPrompt: boolean
        ticketTags?: string[] | null
        ticketAssigneeUserId?: number | null
        ticketAssigneeTeamId?: number | null
        isGreyedOut?: boolean | null
    },
    'end'
>

export type VisualBuilderNode =
    | TriggerButtonNodeType
    | MultipleChoicesNodeType
    | AutomatedMessageNodeType
    | TextReplyNodeType
    | FileUploadNodeType
    | OrderSelectionNodeType
    | HttpRequestNodeType
    | EndNodeType
    | ShopperAuthenticationNodeType

export type VisualBuilderEdge = Edge<{
    event?: WorkflowTransition['event'] | null
}>

export type VisualBuilderGraph = {
    name: string
    available_languages: LanguageCode[]
    nodes: VisualBuilderNode[]
    edges: VisualBuilderEdge[]
    wfConfigurationOriginal: WorkflowConfiguration
}
