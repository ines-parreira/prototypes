import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { StoreActivation } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/AiAgentActivationStoreCard'

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

export const storeConfigurationToState = (
    _state: State,
    { storeConfigurations }: UpdateStoreConfiguration,
): State => {
    return storeConfigurations.reduce<Record<string, StoreActivation>>(
        (state, storeConfiguration) => {
            const isChatEnabled =
                storeConfiguration.scopes.includes(AiAgentScope.Support) &&
                !storeConfiguration.chatChannelDeactivatedDatetime
            const isEmailEnabled =
                storeConfiguration.scopes.includes(AiAgentScope.Support) &&
                !storeConfiguration.emailChannelDeactivatedDatetime

            state[storeConfiguration.storeName] = {
                name: storeConfiguration.storeName,
                title: storeConfiguration.storeName,
                configuration: storeConfiguration,
                support: {
                    enabled: isChatEnabled || isEmailEnabled,
                    chat: {
                        enabled: isChatEnabled,
                        isIntegrationMissing:
                            !storeConfiguration.monitoredChatIntegrations
                                .length,
                    },
                    email: {
                        enabled: isEmailEnabled,
                        isIntegrationMissing:
                            !storeConfiguration.monitoredEmailIntegrations
                                .length,
                    },
                },
                sales: {
                    enabled:
                        storeConfiguration.scopes.includes(
                            AiAgentScope.Sales,
                        ) && isChatEnabled,
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
        case 'UPDATE_STORE_CONFIGURATION':
            return storeConfigurationToState(state, action)
    }
}
