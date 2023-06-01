import {useCallback, useState} from 'react'
import {ulid} from 'ulidx'
import axios from 'axios'
import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'
import {isProduction, isStaging} from 'utils/environment'
import {WAS_THIS_HELPFUL_WORKFLOW_ID} from '../constants'
import {WorkflowConfiguration} from '../types'

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
    deleteWorkflowConfiguration: (configurationId: string) => Promise<void>
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
        deleteWorkflowConfiguration: useCallback((configurationId: string) => {
            setIsUpdatePending(true)
            return apiClient
                .delete<void>(`/configurations/${configurationId}`)
                .then(() => {
                    setIsUpdatePending(false)
                })
        }, []),
        workflowConfigurationFactory,
    }
}

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
                    configuration_id: WAS_THIS_HELPFUL_WORKFLOW_ID,
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
