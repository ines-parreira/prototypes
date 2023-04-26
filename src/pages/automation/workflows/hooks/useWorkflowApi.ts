import {useCallback, useState} from 'react'
import {ulid} from 'ulidx'
import axios from 'axios'
import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'
import {isProduction, isStaging} from 'utils/environment'

const baseURL = isProduction()
    ? `https://api.gorgias.work`
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

export type WorkflowStepWorkflowCall = {
    id: string
    kind: 'workflow_call'
    settings: {
        configuration_id: string
    }
}

export type WorkflowConfiguration = {
    id: string
    internal_id: string
    account_id: number
    is_draft: boolean
    name: string
    initial_step_id: string
    steps: Array<
        WorkflowStepMessages | WorkflowStepChoices | WorkflowStepWorkflowCall
    >
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
    isFetchPending: boolean
    isUpdatePending: boolean
    fetchWorkflowConfigurations: () => Promise<WorkflowConfiguration[]>
    fetchWorkflowConfiguration: (
        id: string
    ) => Promise<Maybe<WorkflowConfiguration>>
    upsertWorkflowConfiguration: (
        data: WorkflowConfiguration
    ) => Promise<WorkflowConfiguration>
    workflowConfigurationFactory: (
        accountId: number,
        workflowId: string
    ) => WorkflowConfiguration
}

export default function useWorkflowApi(): WorkflowApi {
    const [isFetchPending, setIsFetchPending] = useState(false)
    const [isUpdatePending, setIsUpdatePending] = useState(false)
    return {
        isFetchPending,
        isUpdatePending,
        fetchWorkflowConfigurations: useCallback(() => {
            setIsFetchPending(true)
            return apiClient
                .get<WorkflowConfiguration[]>('/configurations')
                .then((res) => {
                    setIsFetchPending(false)
                    return res.data
                })
        }, []),
        fetchWorkflowConfiguration: useCallback((id: string) => {
            setIsFetchPending(true)
            return apiClient
                .get<WorkflowConfiguration>(`/configurations/${id}`)
                .then((res) => {
                    setIsFetchPending(false)
                    return res.data
                })
        }, []),
        upsertWorkflowConfiguration: useCallback(
            (data: WorkflowConfiguration) => {
                setIsUpdatePending(true)
                return apiClient
                    .put<WorkflowConfiguration>(
                        `/configurations/${data.internal_id}`,
                        data
                    )
                    .then((res) => {
                        setIsUpdatePending(false)
                        return res.data
                    })
            },
            []
        ),
        workflowConfigurationFactory,
    }
}

export const wasThisHelpfulWorkflowId = '01GWPRH2G05DYYFBB1GNVNRB19'

export const workflowConfigurationFactory = (
    accountId: number,
    workflowId: string
): WorkflowConfiguration => {
    const initial_step_id = ulid()
    const workflowCallStepId = ulid()
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
            {
                id: workflowCallStepId,
                kind: 'workflow_call',
                settings: {
                    configuration_id: wasThisHelpfulWorkflowId,
                },
            },
        ],
        transitions: [
            {
                id: ulid(),
                from_step_id: initial_step_id,
                to_step_id: workflowCallStepId,
            },
        ],
    }
}
