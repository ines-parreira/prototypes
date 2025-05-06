import { useReducer } from 'react'

import { LDFlagSet } from 'launchdarkly-react-client-sdk'

import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { StoreActivation } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/AiAgentActivationStoreCard'
import { getAiSalesAgentEmailEnabledFlag } from 'pages/aiAgent/Activation/utils'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { AlertType } from 'pages/common/components/Alert/Alert'
import { type Components } from 'rest_api/help_center_api/client.generated'

export const KNOWLEDGE_ALERT_KIND = Symbol('Knowledge Alert')
export type State = Record<string, StoreActivation>
type ToggleSalesAction = {
    type: 'CHANGE_SALES'
    storeName: string
    newValue: boolean
}
type ToggleSupportAction = {
    type: 'CHANGE_SUPPORT'
    storeName: string
    newValue: boolean
}
type ToggleSupportChatAction = {
    type: 'CHANGE_SUPPORT_CHAT'
    storeName: string
    newValue: boolean
}
type ToggleSupportEmailAction = {
    type: 'CHANGE_SUPPORT_EMAIL'
    storeName: string
    newValue: boolean
}
type UpdateStoreConfiguration = {
    type: 'UPDATE_STORE_CONFIGURATION'
    storeConfigurations: StoreConfiguration[]
    selfServiceChatChannels: Record<string, SelfServiceChatChannel[]>
    helpCentersFaq?: Components.Schemas.GetHelpCenterDto[]
    flags: LDFlagSet
}
export type ACTION_TYPE =
    | ToggleSalesAction
    | ToggleSupportAction
    | ToggleSupportChatAction
    | ToggleSupportEmailAction
    | UpdateStoreConfiguration

const toggleSupport = (
    state: State,
    { storeName, newValue }: ToggleSupportAction,
): State => {
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

    const aiSalesAgentEmailEnabled = getAiSalesAgentEmailEnabledFlag()
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
    { storeName, newValue }: ToggleSupportEmailAction,
): State => {
    if (!state[storeName]) {
        return state
    }

    const currentStore = state[storeName]

    const emailEnabled = currentStore.support.email.isIntegrationMissing
        ? currentStore.support.email.enabled
        : newValue
    const chatEnabled = currentStore.support.chat.enabled

    const aiSalesAgentEmailEnabled = getAiSalesAgentEmailEnabledFlag()
    const salesIsDisabled = !chatEnabled && !emailEnabled

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
    }

    if (aiSalesAgentEmailEnabled) {
        newStore.sales = {
            ...currentStore.sales,
            isDisabled: salesIsDisabled,
            enabled: salesIsDisabled ? false : currentStore.sales.enabled,
        }
    }

    return {
        ...state,
        [storeName]: newStore,
    }
}

const toggleSupportChat = (
    state: State,
    { storeName, newValue }: ToggleSupportChatAction,
): State => {
    if (!state[storeName]) {
        return state
    }

    const currentStore = state[storeName]

    const chatEnabled = currentStore.support.chat.isIntegrationMissing
        ? currentStore.support.chat.enabled
        : newValue
    const emailEnabled = currentStore.support.email.enabled

    const aiSalesAgentEmailEnabled = getAiSalesAgentEmailEnabledFlag()
    const salesIsDisabled = aiSalesAgentEmailEnabled
        ? !newValue && !emailEnabled
        : !newValue

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
            enabled: aiSalesAgentEmailEnabled
                ? salesIsDisabled
                    ? false
                    : currentStore.sales.enabled
                : !newValue
                  ? false
                  : currentStore.sales.enabled,
        },
    }

    return {
        ...state,
        [storeName]: newStore,
    }
}

const toggleSales = (
    state: State,
    { storeName, newValue }: ToggleSalesAction,
): State => {
    if (!state[storeName]) {
        return state
    }
    const currentStore = state[storeName]

    const aiSalesAgentEmailEnabled = getAiSalesAgentEmailEnabledFlag()
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

export const storeConfigurationToState = (
    state: State,
    {
        storeConfigurations,
        selfServiceChatChannels,
        helpCentersFaq,
        flags,
    }: UpdateStoreConfiguration,
): State => {
    const hasHelpCenterFaq = (helpCentersFaq ?? []).length > 0

    return storeConfigurations.reduce<Record<string, StoreActivation>>(
        (acc, storeConfiguration) => {
            const {
                storeName,
                scopes,
                chatChannelDeactivatedDatetime,
                emailChannelDeactivatedDatetime,
                monitoredEmailIntegrations,
                helpCenterId,
            } = storeConfiguration

            const isMissingKnowledge =
                helpCenterId === null ||
                !helpCentersFaq?.some((it) => it.id === helpCenterId) ||
                !hasHelpCenterFaq

            const alerts = state[storeName]?.alerts ?? []
            const hasKnowledgeAlert = alerts.some(
                (it) => it.kind === KNOWLEDGE_ALERT_KIND,
            )

            const knowledgeAlert = {
                kind: KNOWLEDGE_ALERT_KIND,
                type: AlertType.Warning,
                message:
                    'At least one knowledge source required. Update your knowledge tab to be able to activate AI Agent.',
                cta: {
                    label: 'Visit Knowledge',
                    to: getAiAgentNavigationRoutes(storeName, flags).knowledge,
                },
            }
            if (isMissingKnowledge && !hasKnowledgeAlert) {
                alerts.push(knowledgeAlert)
            }

            const availableChatsForStore = selfServiceChatChannels[
                storeName
            ].map((it) => it.value.id)

            const isChatIntegrationMissing =
                !storeConfiguration.monitoredChatIntegrations.filter((it) =>
                    availableChatsForStore.includes(it),
                ).length

            const isChatEnabled =
                scopes.includes(AiAgentScope.Support) &&
                !chatChannelDeactivatedDatetime &&
                !isChatIntegrationMissing &&
                !isMissingKnowledge

            const isEmailEnabled =
                scopes.includes(AiAgentScope.Support) &&
                !emailChannelDeactivatedDatetime &&
                !isMissingKnowledge

            const aiSalesAgentEmailEnabled = getAiSalesAgentEmailEnabledFlag()
            const salesIsDisabled = aiSalesAgentEmailEnabled
                ? !isChatEnabled && !isEmailEnabled
                : !isChatEnabled

            acc[storeName] = {
                ...state[storeName],
                name: storeName,
                title: storeName,
                alerts,
                configuration: storeConfiguration,
                support: {
                    enabled: isChatEnabled || isEmailEnabled,
                    chat: {
                        enabled: isChatEnabled,
                        isIntegrationMissing: isChatIntegrationMissing,
                    },
                    email: {
                        enabled: isEmailEnabled,
                        isIntegrationMissing:
                            !monitoredEmailIntegrations.length,
                    },
                },
                sales: {
                    enabled:
                        scopes.includes(AiAgentScope.Sales) &&
                        (aiSalesAgentEmailEnabled
                            ? isChatEnabled || isEmailEnabled
                            : isChatEnabled),
                    isDisabled: salesIsDisabled,
                },
            }
            return acc
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
    }
}

export const useStoreActivationReducer = () => {
    const [state, dispatch] = useReducer(reducer, {})
    return { state, dispatch }
}
