import { createContext, ReactNode, useContext, useState } from 'react'

import { Customer } from '@gorgias/helpdesk-types'

import { Product } from 'constants/integrations/types/shopify'

export const DEFAULT_STATE = {
    mode: 'inbound' as const,
    channel: 'chat' as const,
    chatAvailability: 'online' as const,
    selectedCustomer: null,
    areActionsEnabled: false,
    journeyType: 'cart-abandoned' as const,
    selectedProduct: null,
    totalFollowUp: 1,
    includeProductImage: true,
    includeDiscountCode: true,
    discountCodeValue: 10,
    discountCodeMessageIdx: 1,
    outboundMessageInstructions: '',
}

type SettingsState = {
    // The types will be migrated to the constants/types file later
    // as the new feature will live behind a feature flag for now
    mode: 'inbound' | 'outbound'
    channel: 'email' | 'chat' | 'sms'
    chatAvailability: 'online' | 'offline'
    selectedCustomer: Customer | null
    areActionsEnabled: boolean
    journeyType: 'cart-abandoned' | 'session-abandoned'
    selectedProduct: Product | null
    totalFollowUp: number
    includeProductImage: boolean
    includeDiscountCode: boolean
    discountCodeValue: number
    discountCodeMessageIdx: number
    outboundMessageInstructions: string
}

type SettingsContextValue = {
    resetSettings: () => void
    setSettings: React.Dispatch<React.SetStateAction<SettingsState>>
} & SettingsState

const SettingsContext = createContext<SettingsContextValue | undefined>(
    undefined,
)

export const useSettingsContext = () => {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error(
            'useSettingsContext must be used within a SettingsProvider',
        )
    }
    return context
}

type SettingsProviderProps = {
    children: ReactNode
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
    const [settingsState, setSettingsState] =
        useState<SettingsState>(DEFAULT_STATE)

    const resetSettings = () => {
        setSettingsState(DEFAULT_STATE)
    }

    const value = {
        ...settingsState,
        resetSettings,
        setSettings: setSettingsState,
    }

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    )
}
