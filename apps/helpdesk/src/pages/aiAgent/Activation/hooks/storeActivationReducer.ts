import { useReducer } from 'react'

import cloneDeep from 'lodash/cloneDeep'

import type { StoreConfiguration } from 'models/aiAgent/types'
import { AiAgentScope } from 'models/aiAgent/types'
import type { HelpCenter } from 'models/helpCenter/types'
import type {
    EmailIntegration,
    GmailIntegration,
    OutlookIntegration,
} from 'models/integration/types'
import type { KnowledgeStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/types'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'
import type { ChatIntegrationsStatusData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchChatIntegrationsStatusData'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { AlertType } from 'pages/common/components/Alert/Alert'

export const isSalesEnabledWithNewActivationXp = ({
    storeHasSales,
    hasNewAutomatePlan,
}: {
    storeHasSales: boolean
    hasNewAutomatePlan: boolean
}) => {
    return hasNewAutomatePlan || storeHasSales
}

export const KNOWLEDGE_ALERT_KIND = Symbol('Knowledge Alert')
type AlertKind = typeof KNOWLEDGE_ALERT_KIND

export type Flags = {
    hasAiAgentNewActivationXp: boolean
    aiSalesAgentEmailEnabled: boolean
}
export type Settings = {
    sales: {
        enabled: boolean
        isDisabled: boolean
    }
    support: {
        enabled: boolean
        chat: {
            enabled: boolean
            isIntegrationMissing?: boolean
            isInstallationMissing?: boolean
            availableChats?: number[]
        }
        email: {
            enabled: boolean
            isIntegrationMissing?: boolean
        }
    }
}
type StoreActivationAlert = {
    kind: AlertKind
    type: AlertType
    message: string
    cta: {
        label: string
        onClick?: () => void
        to?: string
    }
}
export type StoreActivation = {
    name: string
    title: string
    alerts: StoreActivationAlert[]
    configuration: StoreConfiguration
    isMissingKnowledge: boolean
} & Settings

export type State = Record<string, StoreActivation>
type ToggleSalesAction = {
    type: 'CHANGE_SALES'
    storeName: string
    newValue: boolean
    flags: Flags
}
type ToggleSupportAction = {
    type: 'CHANGE_SUPPORT'
    storeName: string
    newValue: boolean
    flags: Flags
}
type ToggleSupportChatAction = {
    type: 'CHANGE_SUPPORT_CHAT'
    storeName: string
    newValue: boolean
    flags: Flags
    hasNewAutomatePlan: boolean
}
type ToggleSupportEmailAction = {
    type: 'CHANGE_SUPPORT_EMAIL'
    storeName: string
    newValue: boolean
    flags: Flags
    hasNewAutomatePlan: boolean
}
type UpdateStoreConfiguration = {
    type: 'UPDATE_STORE_CONFIGURATION'
    storeConfigurations: StoreConfiguration[]
    selfServiceChatChannels: Record<string, SelfServiceChatChannel[]>
    emailIntegrations: (
        | EmailIntegration
        | GmailIntegration
        | OutlookIntegration
    )[]
    storesKnowledgeStatus?: Record<string, KnowledgeStatus>
    helpCentersFaq?: HelpCenter[]
    chatIntegrationStatus?: ChatIntegrationsStatusData
    hasNewAutomatePlan: boolean
    flags: Flags
}
type UpdatePricing = {
    type: 'UPDATE_PRICING'
    flags: Flags
}

export type ACTION_TYPE =
    | ToggleSalesAction
    | ToggleSupportAction
    | ToggleSupportChatAction
    | ToggleSupportEmailAction
    | UpdateStoreConfiguration
    | UpdatePricing

const toggleSupport = (
    state: State,
    {
        storeName,
        newValue,
        flags: { hasAiAgentNewActivationXp, aiSalesAgentEmailEnabled },
    }: ToggleSupportAction,
): State => {
    // Returning the current state as new activation XP has no toggle for Support
    if (hasAiAgentNewActivationXp) {
        return state
    }

    if (!state[storeName]) {
        return state
    }

    const currentStore = state[storeName]

    const chatEnabled = currentStore.support.chat.isIntegrationMissing
        ? currentStore.support.chat.enabled
        : newValue

    const emailEnabled = currentStore.support.email.isIntegrationMissing
        ? currentStore.support.email.enabled
        : newValue

    const salesIsDisabled = aiSalesAgentEmailEnabled
        ? !chatEnabled && !emailEnabled
        : !chatEnabled

    const newStore: StoreActivation = {
        ...state[storeName],
        support: {
            enabled: chatEnabled || emailEnabled,
            chat: {
                ...currentStore.support.chat,
                enabled: chatEnabled,
            },
            email: {
                ...currentStore.support.email,
                enabled: emailEnabled,
            },
        },
        sales: {
            ...currentStore.sales,
            isDisabled: salesIsDisabled,
            enabled: salesIsDisabled ? false : currentStore.sales.enabled,
        },
    }

    return {
        ...state,
        [storeName]: newStore,
    }
}

const toggleSupportEmail = (
    state: State,
    {
        storeName,
        newValue,
        flags: { hasAiAgentNewActivationXp },
    }: ToggleSupportEmailAction,
): State => {
    if (!state[storeName]) {
        return state
    }

    const currentStore = state[storeName]

    const emailEnabled = currentStore.support.email.isIntegrationMissing
        ? false
        : newValue
    const chatEnabled = currentStore.support.chat.enabled

    let salesEnabled: boolean
    let salesIsDisabled: boolean
    if (hasAiAgentNewActivationXp) {
        salesEnabled = currentStore.sales.enabled
        salesIsDisabled = currentStore.sales.isDisabled
    } else {
        salesIsDisabled = !chatEnabled && !emailEnabled
        salesEnabled = salesIsDisabled ? false : currentStore.sales.enabled
    }

    const newStore: StoreActivation = {
        ...currentStore,
        support: {
            ...currentStore.support,
            enabled: chatEnabled || emailEnabled,
            email: {
                ...currentStore.support.email,
                enabled: emailEnabled,
            },
        },
        sales: {
            ...currentStore.sales,
            isDisabled: salesIsDisabled,
            enabled: salesEnabled,
        },
    }

    return {
        ...state,
        [storeName]: newStore,
    }
}

const toggleSupportChat = (
    state: State,
    {
        storeName,
        newValue,
        flags: { hasAiAgentNewActivationXp, aiSalesAgentEmailEnabled },
    }: ToggleSupportChatAction,
): State => {
    if (!state[storeName]) {
        return state
    }

    const currentStore = state[storeName]

    const chatEnabled =
        currentStore.support.chat.isIntegrationMissing ||
        currentStore.support.chat.isInstallationMissing
            ? false
            : newValue
    const emailEnabled = currentStore.support.email.enabled

    let salesIsDisabled: boolean
    let salesEnabled: boolean
    if (hasAiAgentNewActivationXp) {
        salesEnabled = currentStore.sales.enabled
        salesIsDisabled = currentStore.sales.isDisabled
    } else {
        salesIsDisabled = aiSalesAgentEmailEnabled
            ? !newValue && !emailEnabled
            : !newValue
        salesEnabled = aiSalesAgentEmailEnabled
            ? salesIsDisabled
                ? false
                : currentStore.sales.enabled
            : !newValue
              ? false
              : currentStore.sales.enabled
    }

    const newStore: StoreActivation = {
        ...currentStore,
        support: {
            ...currentStore.support,
            enabled: chatEnabled || emailEnabled,
            chat: {
                ...currentStore.support.chat,
                enabled: chatEnabled,
            },
        },
        sales: {
            ...currentStore.sales,
            isDisabled: salesIsDisabled,
            enabled: salesEnabled,
        },
    }

    return {
        ...state,
        [storeName]: newStore,
    }
}

const toggleSales = (
    state: State,
    {
        storeName,
        newValue,
        flags: { hasAiAgentNewActivationXp, aiSalesAgentEmailEnabled },
    }: ToggleSalesAction,
): State => {
    // Returning the current state as new activation XP has no toggle for Sales
    if (hasAiAgentNewActivationXp) {
        return state
    }

    if (!state[storeName]) {
        return state
    }
    const currentStore = state[storeName]

    const isSalesDisabled = aiSalesAgentEmailEnabled
        ? !currentStore.support.email.enabled &&
          !currentStore.support.chat.enabled
        : !currentStore.support.chat.enabled

    const newStore: StoreActivation = {
        ...state[storeName],
        sales: {
            ...currentStore.sales,
            enabled: isSalesDisabled ? false : newValue,
        },
    }

    return {
        ...state,
        [storeName]: newStore,
    }
}

export const checkIsMissingKnowledge = ({
    helpCenterId,
    helpCentersFaq,
    storeKnowledgeStatus,
}: {
    helpCenterId: number | null
    helpCentersFaq?: HelpCenter[]
    storeKnowledgeStatus?: KnowledgeStatus
}): boolean => {
    const hasHelpCenterFaq = (helpCentersFaq ?? []).length > 0

    const hasHelpCenter =
        helpCenterId !== null &&
        !!helpCentersFaq?.some((it) => it.id === helpCenterId) &&
        hasHelpCenterFaq
    const hasPublicUrls = !!storeKnowledgeStatus?.has_public_resources
    const hasSyncedOnce = !!storeKnowledgeStatus?.is_store_domain_synced
    const hasExternalDocuments = !!storeKnowledgeStatus?.has_external_documents

    return (
        !hasHelpCenter &&
        !hasPublicUrls &&
        !hasSyncedOnce &&
        !hasExternalDocuments
    )
}

export const getChatActivation = ({
    chatIntegrationStatus,
    helpCentersFaq,
    storeKnowledgeStatus,
    selfServiceChatChannels,
    storeConfiguration,
}: {
    chatIntegrationStatus?: ChatIntegrationsStatusData
    helpCentersFaq?: HelpCenter[]
    storeKnowledgeStatus?: KnowledgeStatus
    selfServiceChatChannels: SelfServiceChatChannel[]
    storeConfiguration: StoreConfiguration
}): {
    availableMonitoredChat: number[]
    enabled: boolean
    installationMissing: boolean
    integrationMissing: boolean
} => {
    const { chatChannelDeactivatedDatetime, helpCenterId } = storeConfiguration

    const isMissingKnowledge = checkIsMissingKnowledge({
        helpCenterId,
        helpCentersFaq,
        storeKnowledgeStatus,
    })

    const availableMonitoredChat =
        storeConfiguration.monitoredChatIntegrations.filter((it) =>
            selfServiceChatChannels.some((chat) => chat.value.id === it),
        )

    const isChatIntegrationMissing = !availableMonitoredChat.length
    let isChatInstallationMissing: boolean
    if (isChatIntegrationMissing) {
        isChatInstallationMissing = false
    } else {
        isChatInstallationMissing = !chatIntegrationStatus
            ?.filter((status) =>
                availableMonitoredChat.some((id) => id === status.chatId),
            )
            .some((it) => it.installed)
    }

    const isEnabled =
        !chatChannelDeactivatedDatetime &&
        !isChatIntegrationMissing &&
        !isMissingKnowledge &&
        !isChatInstallationMissing
    return {
        availableMonitoredChat,
        enabled: isEnabled,
        installationMissing: isChatInstallationMissing,
        integrationMissing: isChatIntegrationMissing,
    }
}

export const storeConfigurationToState = (
    state: State,
    {
        storeConfigurations,
        selfServiceChatChannels,
        emailIntegrations,
        helpCentersFaq,
        chatIntegrationStatus,
        storesKnowledgeStatus,
        hasNewAutomatePlan,
        flags: { hasAiAgentNewActivationXp, aiSalesAgentEmailEnabled },
    }: UpdateStoreConfiguration,
): State => {
    return storeConfigurations.reduce<Record<string, StoreActivation>>(
        (acc, storeConfiguration) => {
            const {
                storeName,
                scopes,
                emailChannelDeactivatedDatetime,
                monitoredEmailIntegrations,
                helpCenterId,
            } = storeConfiguration

            const isMissingKnowledge = checkIsMissingKnowledge({
                helpCenterId,
                helpCentersFaq,
                storeKnowledgeStatus: storesKnowledgeStatus?.[storeName],
            })

            const alerts: StoreActivationAlert[] = []
            const knowledgeAlert: StoreActivationAlert = {
                kind: KNOWLEDGE_ALERT_KIND,
                type: AlertType.Warning,
                message:
                    'At least one knowledge source required. Update your knowledge tab to be able to activate AI Agent.',
                cta: {
                    label: 'Visit Knowledge',
                    to: getAiAgentNavigationRoutes(storeName).knowledge,
                },
            }
            if (isMissingKnowledge) {
                alerts.push(knowledgeAlert)
            }

            const availableChatsForStore = selfServiceChatChannels[storeName]

            const {
                availableMonitoredChat,
                enabled: isChatEnabled,
                installationMissing: isChatInstallationMissing,
                integrationMissing: isChatIntegrationMissing,
            } = getChatActivation({
                storeConfiguration,
                selfServiceChatChannels: availableChatsForStore,
                helpCentersFaq,
                chatIntegrationStatus,
                storeKnowledgeStatus: storesKnowledgeStatus?.[storeName],
            })

            const isEmailIntegrationMissing = !monitoredEmailIntegrations.some(
                ({ id }) => emailIntegrations.some((email) => email.id === id),
            )

            const isEmailEnabled =
                !emailChannelDeactivatedDatetime &&
                !isMissingKnowledge &&
                !isEmailIntegrationMissing

            let salesEnabled: boolean
            let salesIsDisabled: boolean
            if (hasAiAgentNewActivationXp) {
                salesEnabled = isSalesEnabledWithNewActivationXp({
                    storeHasSales: scopes.includes(AiAgentScope.Sales),
                    hasNewAutomatePlan,
                })
                salesIsDisabled = !salesEnabled
            } else {
                salesIsDisabled = aiSalesAgentEmailEnabled
                    ? !isChatEnabled && !isEmailEnabled
                    : !isChatEnabled
                salesEnabled =
                    scopes.includes(AiAgentScope.Sales) &&
                    (aiSalesAgentEmailEnabled
                        ? isChatEnabled || isEmailEnabled
                        : isChatEnabled)
            }

            acc[storeName] = {
                ...state[storeName],
                name: storeName,
                title: storeName,
                alerts,
                configuration: storeConfiguration,
                isMissingKnowledge,

                support: {
                    enabled: isChatEnabled || isEmailEnabled,
                    chat: {
                        enabled: isChatEnabled,
                        isIntegrationMissing: isChatIntegrationMissing,
                        isInstallationMissing: isChatInstallationMissing,
                        availableChats: availableMonitoredChat,
                    },
                    email: {
                        enabled: isEmailEnabled,
                        isIntegrationMissing: isEmailIntegrationMissing,
                    },
                },
                sales: {
                    enabled: salesEnabled,
                    isDisabled: salesIsDisabled,
                },
            }
            return acc
        },
        {},
    )
}

export const updatePricing = (
    state: State,
    { flags: { hasAiAgentNewActivationXp } }: UpdatePricing,
): State => {
    if (!hasAiAgentNewActivationXp) {
        return state
    }

    return Object.entries(state).reduce<State>(
        (newState, [storeName, storeActivation]) => {
            const {
                configuration: { scopes },
            } = storeActivation

            const salesEnabled = isSalesEnabledWithNewActivationXp({
                storeHasSales: scopes.includes(AiAgentScope.Sales),
                hasNewAutomatePlan: true,
            })

            newState[storeName] = {
                ...storeActivation,
                sales: {
                    ...storeActivation.sales,
                    enabled: salesEnabled,
                    isDisabled: !salesEnabled,
                },
            }
            return newState
        },
        {},
    )
}

export const reducer = (state: State, action: ACTION_TYPE): State => {
    switch (action.type) {
        case 'CHANGE_SUPPORT':
            return toggleSupport(state, action)
        case 'CHANGE_SUPPORT_CHAT':
            return toggleSupportChat(state, action)
        case 'CHANGE_SUPPORT_EMAIL':
            return toggleSupportEmail(state, action)
        case 'CHANGE_SALES':
            return toggleSales(state, action)
        case 'UPDATE_STORE_CONFIGURATION':
            return storeConfigurationToState(state, action)
        case 'UPDATE_PRICING':
            return updatePricing(state, action)
    }
}

/**
 * Clears the `salesDeactivatedDatetime` field when the plan is changed
 */
export const clearSalesDeactivatedDatetime = (
    state: State,
): StoreConfiguration[] => {
    return Object.values(state).map((store) => {
        return {
            ...cloneDeep(store.configuration),
            salesDeactivatedDatetime: null,
        }
    })
}

/**
 * Convert the state to a list of updated store configuration:
 * - set default values for AI Sales agent when activating Sales.
 */
export const stateToUpdatedStoreConfiguration = (
    state: State,
    updateState?: Partial<StoreConfiguration>,
): StoreConfiguration[] => {
    return Object.values(state).map((store) => {
        const newStoreConfiguration = {
            ...cloneDeep(store.configuration),
            ...updateState,
        }

        const scopes: AiAgentScope[] = [AiAgentScope.Support]
        if (store.sales.enabled) {
            scopes.push(AiAgentScope.Sales)
        }
        newStoreConfiguration.scopes = scopes

        // Default settings for newly activated sales.
        if (
            store.sales.enabled &&
            !store.configuration.scopes.includes(AiAgentScope.Sales)
        ) {
            newStoreConfiguration.salesPersuasionLevel =
                PersuasionLevel.Educational
            newStoreConfiguration.salesDiscountStrategyLevel =
                DiscountStrategy.NoDiscount
            newStoreConfiguration.salesDiscountMax = null
        }

        // Do not override emailChannelDeactivatedDatetime email not changed
        if (
            !store.support.email.enabled &&
            store.configuration.emailChannelDeactivatedDatetime === null
        ) {
            newStoreConfiguration.emailChannelDeactivatedDatetime =
                new Date().toISOString()
        }

        // Do not override chatChannelDeactivatedDatetime chat not changed
        if (
            !store.support.chat.enabled &&
            store.configuration.chatChannelDeactivatedDatetime === null
        ) {
            newStoreConfiguration.chatChannelDeactivatedDatetime =
                new Date().toISOString()
        }

        if (store.support.email.enabled) {
            newStoreConfiguration.emailChannelDeactivatedDatetime = null
        }

        if (store.support.chat.enabled) {
            newStoreConfiguration.chatChannelDeactivatedDatetime = null
        }

        return newStoreConfiguration
    })
}

export const useStoreActivationReducer = () => {
    const [state, dispatch] = useReducer(reducer, {})
    return { state, dispatch }
}
