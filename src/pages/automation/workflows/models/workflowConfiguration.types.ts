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

export type WorkflowStepTextInput = {
    id: string
    kind: 'text-input'
}

export type WorkflowStepAttachmentsInput = {
    id: string
    kind: 'attachments-input'
}

export type WorkflowStepChoices = {
    id: string
    kind: 'choices'
    settings: {
        choices: Array<{
            event_id: string
            label: string
            label_tkey?: string
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

export type WorkflowStepHandover = {
    id: string
    kind: 'handover'
    settings: {
        ticket_tags?: string[] | null
        ticket_assignee_user_id?: number | null
        ticket_assignee_team_id?: number | null
    }
}

export type WorkflowStepShopperAuthentication = {
    id: string
    kind: 'shopper-authentication'
    settings: {
        integration_id: number
    }
}

export type WorkflowStep =
    | WorkflowStepMessages
    | WorkflowStepTextInput
    | WorkflowStepAttachmentsInput
    | WorkflowStepChoices
    | WorkflowStepWorkflowCall
    | WorkflowStepHandover
    | WorkflowStepShopperAuthentication

export type WorkflowTransition = {
    id: string
    from_step_id: string
    to_step_id: string
    event?: Maybe<{
        id: string
        kind: 'choices'
    }>
}

export const supportedLanguages = [
    {code: 'en-US', label: 'English'} as const,
    {code: 'fr-FR', label: 'French (FR)'} as const,
    {code: 'fr-CA', label: 'French (CA)'} as const,
    {code: 'es-ES', label: 'Spanish'} as const,
    {code: 'de-DE', label: 'German'} as const,
    {code: 'nl-NL', label: 'Dutch'} as const,
    {code: 'cs-CZ', label: 'Czech'} as const,
    {code: 'da-DK', label: 'Danish'} as const,
    {code: 'no-NO', label: 'Norwegian'} as const,
    {code: 'it-IT', label: 'Italian'} as const,
    {code: 'sv-SE', label: 'Swedish'} as const,
] as const
export type LanguageCode = typeof supportedLanguages[number]['code']

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
    available_languages?: LanguageCode[]
}

export type WorkflowConfigurationShallow = Omit<
    WorkflowConfiguration,
    'steps' | 'transitions'
> & {
    steps: Array<{
        kind: WorkflowStep['kind']
    }>
}

export type WorkflowTemplate = {
    slug: string
    name: string
    description: string
    getConfiguration: (
        id: string,
        accountId: number // TODO: it shouldn't be a user input
    ) => WorkflowConfiguration
}
