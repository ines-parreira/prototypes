import {IntegrationType} from '../constants'
import type {IntegrationBase} from './base'

// Typings for https://cdn.runalloy.com/scripts/embedded.js
declare global {
    interface Window {
        Alloy: {
            setToken(token: string): void
            install(params: {
                integrationId?: string
                workflowIds?: string[]
                callback?: () => void
                alwaysShowAuthentication?: boolean
                hide?: boolean
                title?: string
            }): void
        }
    }
}

export type AlloyIntegration = IntegrationBase & {
    type: IntegrationType.Alloy
    meta: AlloyIntegrationMeta
}

export type AlloyIntegrationMeta = {
    app_id: string
    integration_id: string
}

export type AlloyInitInfo = {
    userId: string
    userToken: string
    isInstalled: boolean
    isActive: boolean
}
