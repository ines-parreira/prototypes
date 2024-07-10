import {useCallback, useState} from 'react'
import {ulid} from 'ulidx'
import axios from 'axios'
import {useQueryClient} from '@tanstack/react-query'
import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'
import {isProduction, isStaging} from 'utils/environment'
import {workflowsConfigurationDefinitionKeys} from 'models/workflows/queries'
import {WorkflowConfiguration} from '../models/workflowConfiguration.types'

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

    fetchWorkflowConfiguration: (
        id: string
    ) => Promise<Maybe<WorkflowConfiguration>>
    fetchWorkflowTranslations: (
        internalId: string,
        language: string
    ) => Promise<Record<string, string>>
    upsertWorkflowTranslations: (
        internalId: string,
        language: string,
        translations: Record<string, string>
    ) => Promise<void>
    deleteWorkflowTranslations: (
        internalId: string,
        language: string
    ) => Promise<void>
    upsertWorkflowConfiguration: (
        data: WorkflowConfiguration
    ) => Promise<WorkflowConfiguration>
    workflowConfigurationFactory: (
        accountId: number,
        workflowId: string
    ) => WorkflowConfiguration
    deleteWorkflowConfiguration: (
        configurationInternalId: string
    ) => Promise<void>
    duplicateWorkflowConfiguration: (
        configurationId: string,
        storeIntegrationId: number
    ) => Promise<WorkflowConfiguration>
}

export default function useWorkflowApi(): WorkflowApi {
    const [isFetchPending, setIsFetchPending] = useState(false)
    const [isUpdatePending, setIsUpdatePending] = useState(false)
    const queryClient = useQueryClient()

    const fetchWorkflowConfiguration = useCallback((id: string) => {
        setIsFetchPending(true)
        return apiClient
            .get<WorkflowConfiguration>(`/configurations/${id}`)
            .then((res) => {
                setIsFetchPending(false)
                return res.data
            })
    }, [])
    const upsertWorkflowConfiguration = useCallback(
        (data: WorkflowConfiguration) => {
            setIsUpdatePending(true)
            return apiClient
                .put<WorkflowConfiguration>(
                    `/configurations/${data.internal_id}`,
                    data
                )
                .then((res) => {
                    setIsUpdatePending(false)
                    void queryClient.invalidateQueries({
                        queryKey: workflowsConfigurationDefinitionKeys.all(),
                    })
                    return res.data
                })
        },
        [queryClient]
    )
    const deleteWorkflowConfiguration = useCallback(
        (configurationInternalId: string) => {
            setIsUpdatePending(true)
            return apiClient
                .delete<void>(`/configurations/${configurationInternalId}`)
                .then(() => {
                    setIsUpdatePending(false)
                })
        },
        []
    )
    const duplicateWorkflowConfiguration = useCallback(
        async (configurationId: string, integrationId: number) => {
            setIsUpdatePending(true)
            return apiClient
                .post<WorkflowConfiguration>(
                    `/configurations/${configurationId}/duplicate`,
                    {
                        integration_id: integrationId,
                    }
                )
                .then((res) => {
                    setIsUpdatePending(false)
                    return res.data
                })
        },
        []
    )
    const fetchWorkflowTranslations = useCallback(
        (internalId: string, language: string) => {
            setIsFetchPending(true)
            return apiClient
                .get<Record<string, string>>(
                    `/configurations/${internalId}/translations/${language}`
                )
                .then((res) => {
                    setIsFetchPending(false)
                    return res.data
                })
        },
        []
    )
    const upsertWorkflowTranslations = useCallback(
        (
            internalId: string,
            language: string,
            translations: Record<string, string>
        ) => {
            setIsUpdatePending(true)
            return apiClient
                .put<void>(
                    `/configurations/${internalId}/translations/${language}`,
                    translations
                )
                .then(() => {
                    setIsUpdatePending(false)
                })
        },
        []
    )
    const deleteWorkflowTranslations = useCallback(
        (internalId: string, language: string) => {
            setIsUpdatePending(true)
            return apiClient
                .delete<void>(
                    `/configurations/${internalId}/translations/${language}`
                )
                .then(() => {
                    setIsUpdatePending(false)
                })
        },
        []
    )

    return {
        isFetchPending,
        isUpdatePending,
        workflowConfigurationFactory,
        fetchWorkflowConfiguration,
        upsertWorkflowConfiguration,
        deleteWorkflowConfiguration,
        duplicateWorkflowConfiguration,
        fetchWorkflowTranslations,
        upsertWorkflowTranslations,
        deleteWorkflowTranslations,
    }
}

export const workflowConfigurationFactory = (
    accountId: number,
    workflowId: string
): WorkflowConfiguration => {
    const messageStepId = ulid()
    const helpfulPromptStepId = ulid()
    return {
        id: workflowId,
        internal_id: ulid(),
        account_id: accountId,
        is_draft: true,
        name: '',
        initial_step_id: messageStepId,
        available_languages: ['en-US'],
        entrypoint: {
            label: '',
            label_tkey: ulid(),
        },
        steps: [
            {
                id: messageStepId,
                kind: 'message',
                settings: {
                    message: {
                        content: {
                            text: '',
                            text_tkey: ulid(),
                            html: '',
                            html_tkey: ulid(),
                        },
                    },
                },
            },
            {
                id: helpfulPromptStepId,
                kind: 'helpful-prompt',
            },
        ],
        transitions: [
            {
                id: ulid(),
                from_step_id: messageStepId,
                to_step_id: helpfulPromptStepId,
            },
        ],
    }
}
