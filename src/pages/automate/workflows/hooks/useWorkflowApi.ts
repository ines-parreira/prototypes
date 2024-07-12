import {useCallback, useState} from 'react'
import {ulid} from 'ulidx'
import axios from 'axios'
import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'
import {isProduction, isStaging} from 'utils/environment'
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
    workflowConfigurationFactory: (
        accountId: number,
        workflowId: string
    ) => WorkflowConfiguration
}

export default function useWorkflowApi(): WorkflowApi {
    const [isFetchPending, setIsFetchPending] = useState(false)
    const [isUpdatePending, setIsUpdatePending] = useState(false)

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
