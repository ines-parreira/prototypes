import { createContext, useContext } from 'react'

import { IntegrationWithBusinessHoursAndStore } from '@gorgias/helpdesk-types'

export type CustomBusinessHoursContextState = {
    businessHoursId?: number
    integrationsToOverride: number[]
    toggleIntegrationsToOverride: (
        integrations: IntegrationWithBusinessHoursAndStore[],
        selected: boolean,
    ) => void
    resetIntegrationsToOverride: () => void
}

export const CustomBusinessHoursContext =
    createContext<CustomBusinessHoursContextState | null>(null)

export const useCustomBusinessHoursContext = () => {
    const context = useContext(CustomBusinessHoursContext)

    if (!context) {
        throw new Error(
            'useCustomBusinessHoursContext must be used within a CustomBusinessHoursProvider',
        )
    }

    return context
}
