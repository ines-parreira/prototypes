import { LDFlagSet } from 'launchdarkly-react-client-sdk'

import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { StoreActivation } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/AiAgentActivationStoreCard'
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
}
type UpdateHelpCenterFaq = {
    type: 'UPDATE_HELP_CENTER_FAQ'
    helpCenters?: Components.Schemas.GetHelpCenterDto[]
    flags: LDFlagSet
}
export type ACTION_TYPE =
    | ToggleSalesAction
    | ToggleSupportAction
    | ToggleSupportChatAction
    | ToggleSupportEmailAction
    | UpdateStoreConfiguration
    | UpdateHelpCenterFaq

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
            isDisabled: !chatEnabled,
            enabled: !newValue ? false : currentStore.sales.enabled,
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
            isDisabled: !newValue,
            enabled: !newValue ? false : currentStore.sales.enabled,
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
    const newStore: StoreActivation = {
        ...state[storeName],
        sales: {
            ...currentStore.sales,
            enabled: currentStore.support.chat.enabled ? newValue : false,
        },
    }

    return {
        ...state,
        [storeName]: newStore,
    }
}

const updateHelpCenterFaq = (
    state: State,
    { helpCenters, flags }: UpdateHelpCenterFaq,
): State => {
    const hasHelpCenterFaq = (helpCenters ?? []).length > 0
    return Object.entries(state).reduce<Record<string, StoreActivation>>(
        (acc, [storeName, store]) => {
            const isMissingKnowledge =
                store.configuration.helpCenterId === null && hasHelpCenterFaq
            const hasKnowledgeAlert = store.alerts.some(
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

            const alerts = store.alerts
            if (isMissingKnowledge && !hasKnowledgeAlert) {
                alerts.push(knowledgeAlert)
            }
            acc[storeName] = {
                ...store,
                support: {
                    ...store.support,
                    chat: {
                        ...store.support.chat,
                        enabled: isMissingKnowledge
                            ? false
                            : store.support.chat.enabled,
                    },
                    email: {
                        ...store.support.email,
                        enabled: isMissingKnowledge
                            ? false
                            : store.support.email.enabled,
                    },
                },
                sales: {
                    ...store.sales,
                    enabled: isMissingKnowledge ? false : store.sales.enabled,
                },
                alerts,
            }
            return acc
        },
        {},
    )
}

export const storeConfigurationToState = (
    _state: State,
    { storeConfigurations, selfServiceChatChannels }: UpdateStoreConfiguration,
): State => {
    return storeConfigurations.reduce<Record<string, StoreActivation>>(
        (state, storeConfiguration) => {
            const {
                storeName,
                scopes,
                chatChannelDeactivatedDatetime,
                emailChannelDeactivatedDatetime,
                monitoredEmailIntegrations,
            } = storeConfiguration

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
                !isChatIntegrationMissing

            const isEmailEnabled =
                scopes.includes(AiAgentScope.Support) &&
                !emailChannelDeactivatedDatetime

            state[storeName] = {
                name: storeName,
                title: storeName,
                alerts: [],
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
                        scopes.includes(AiAgentScope.Sales) && isChatEnabled,
                    isDisabled: !isChatEnabled,
                },
            }
            return state
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
        case 'UPDATE_HELP_CENTER_FAQ':
            return updateHelpCenterFaq(state, action)
        case 'UPDATE_STORE_CONFIGURATION':
            return storeConfigurationToState(state, action)
    }
}
