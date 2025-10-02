import axios from 'axios'

import { isProduction, isStaging } from 'utils/environment'
import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'

import {
    CreatePostStoreInstallationStepPayload,
    GetPostStoreInstallationStepsParams,
    GetPostStoreInstallationStepsResponse,
    PostStoreInstallationSteps,
    PostStoreInstallationStepsResponse,
    UpdateNotificationAcknowledgementRequest,
    UpdateStepRequest,
} from './types'

/**
 * API Client for AI Agent Post-Store Installation Steps
 */

const domain = isProduction()
    ? `https://aiagent.gorgias.help`
    : isStaging()
      ? 'https://aiagent.gorgias.rehab'
      : `http://localhost:9402`

const baseURL = `${domain}/api`

// eslint-disable-next-line no-restricted-properties
export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

apiClient.interceptors.request.use(gorgiasAppsAuthInterceptor)

/**
 * Post-Store Installation Steps endpoints
 */

export const createPostStoreInstallationStep = async (
    data: CreatePostStoreInstallationStepPayload,
) => {
    const response = await apiClient.post<PostStoreInstallationStepsResponse>(
        `/config/post-store-installation-steps`,
        data,
    )
    return response.data
}

export const getPostStoreInstallationSteps = async (
    params: GetPostStoreInstallationStepsParams,
) => {
    const response = await apiClient.get<GetPostStoreInstallationStepsResponse>(
        `/config/post-store-installation-steps`,
        { params },
    )
    return response.data
}

export const updatePostStoreInstallationStep = async (
    id: string,
    data: Partial<PostStoreInstallationSteps>,
) => {
    const response = await apiClient.put<PostStoreInstallationStepsResponse>(
        `/config/post-store-installation-steps/${id}`,
        data,
    )
    return response.data
}

export const updateStepConfiguration = async (
    id: string,
    stepData: UpdateStepRequest,
) => {
    const response = await apiClient.patch<PostStoreInstallationStepsResponse>(
        `/config/post-store-installation-steps/${id}/step`,
        stepData,
    )
    return response.data
}

export const updateStepNotifications = async (
    id: string,
    notificationData: UpdateNotificationAcknowledgementRequest,
) => {
    const response = await apiClient.patch<PostStoreInstallationStepsResponse>(
        `/config/post-store-installation-steps/${id}/update-step-notifications`,
        notificationData,
    )
    return response.data
}
