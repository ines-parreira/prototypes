import {useCallback} from 'react'
import {ulid} from 'ulidx'
import axios from 'axios'
import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'
import {isProduction, isStaging} from 'utils/environment'

const baseURL = isProduction()
    ? `http://api.gorgias.work`
    : isStaging()
    ? 'https://api-staging.gorgias.work'
    : `http://localhost:3100`
// eslint-disable-next-line no-restricted-properties
const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})
apiClient.interceptors.request.use(gorgiasAppsAuthInterceptor)

export type MessageContent = {
    html: string
    text: string
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

export type WorkflowConfiguration = {
    id: string
    internal_id: string
    account_id: number
    is_draft: boolean
    name: string
    initial_step_id: string
    steps: Array<WorkflowStepMessages | WorkflowStepChoices>
    transitions: Array<{
        id: string
        from_step_id: string
        to_step_id: string
        event?: Maybe<{
            id: string
            kind: 'choices'
        }>
    }>
}

type WorkflowApi = {
    fetchWorkflowConfigurations: () => Promise<WorkflowConfiguration[]>
    fetchWorkflowConfiguration: (
        id: string
    ) => Promise<Maybe<WorkflowConfiguration>>
    createWorkflowConfiguration: (
        data: WorkflowConfiguration
    ) => Promise<WorkflowConfiguration>
    updateWorkflowConfiguration: (
        data: WorkflowConfiguration
    ) => Promise<WorkflowConfiguration>
    workflowConfigurationFactory: (
        accountId: number,
        workflowId: string
    ) => WorkflowConfiguration
}

export default function useWorkflowApi(): WorkflowApi {
    return {
        fetchWorkflowConfigurations: useCallback(() => {
            return apiClient
                .get<WorkflowConfiguration[]>('/configurations')
                .then((res) => res.data)
        }, []),
        fetchWorkflowConfiguration: useCallback((id: string) => {
            return apiClient
                .get<WorkflowConfiguration>(`/configurations/${id}`)
                .then((res) => res.data)
        }, []),
        createWorkflowConfiguration: useCallback(
            (data: WorkflowConfiguration) => {
                return apiClient
                    .post<WorkflowConfiguration>('/configurations', data)
                    .then((res) => res.data)
            },
            []
        ),
        updateWorkflowConfiguration: useCallback(
            (data: WorkflowConfiguration) => {
                return apiClient
                    .put<WorkflowConfiguration>(
                        `/configurations/${data.internal_id}`,
                        data
                    )
                    .then((res) => res.data)
            },
            []
        ),
        workflowConfigurationFactory,
    }
}

export const workflowConfigurationFactory = (
    accountId: number,
    workflowId: string
): WorkflowConfiguration => {
    const initial_step_id = ulid()
    return {
        id: workflowId,
        internal_id: ulid(),
        account_id: accountId,
        is_draft: false,
        name: '',
        initial_step_id,
        steps: [
            {
                id: initial_step_id,
                kind: 'messages',
                settings: {
                    messages: [{content: {html: '', text: ''}}],
                },
            },
        ],
        transitions: [],
    }
}
