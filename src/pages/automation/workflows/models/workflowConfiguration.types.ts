import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'

export type MessageContent = {
    html: string
    html_tkey?: string
    text: string
    text_tkey?: string
    attachments?: ProductCardAttachment[] | null
}

export type WorkflowStepMessages = {
    id: string
    kind: 'messages'
    settings: {
        messages: Array<{
            content: MessageContent
        }>
    }
}

export type WorkflowStepChoices = {
    id: string
    kind: 'choices'
    settings: {
        choices: Array<{
            event_id: string
            label: string
        }>
    }
}

export type WorkflowStepWorkflowCall = {
    id: string
    kind: 'workflow_call'
    settings: {
        configuration_id: string
    }
}

export type WorkflowStep =
    | WorkflowStepMessages
    | WorkflowStepChoices
    | WorkflowStepWorkflowCall

export type WorkflowTransition = {
    id: string
    from_step_id: string
    to_step_id: string
    event?: Maybe<{
        id: string
        kind: 'choices'
    }>
}

export type WorkflowConfiguration = {
    id: string
    internal_id: string
    account_id: number
    is_draft: boolean
    name: string
    initial_step_id: string
    entrypoint?: {
        label: string
        label_tkey: string
    }
    steps: WorkflowStep[]
    transitions: WorkflowTransition[]
}

export type WorkflowConfigurationShallow = Omit<
    WorkflowConfiguration,
    'steps' | 'transitions'
>

export type WorkflowTemplate = {
    slug: string
    name: string
    description: string
    previewImg: string
    getConfiguration: (
        id: string,
        accountId: number // TODO: it shouldn't be a user input
    ) => WorkflowConfiguration
}
