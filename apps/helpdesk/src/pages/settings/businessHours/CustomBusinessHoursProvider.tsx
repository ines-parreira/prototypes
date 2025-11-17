import { useState } from 'react'

import type { IntegrationWithBusinessHoursAndStore } from '@gorgias/helpdesk-types'

import { CustomBusinessHoursContext } from './CustomBusinessHoursContext'

export default function CustomBusinessHoursProvider({
    children,
    businessHoursId,
}: {
    children: React.ReactNode
    businessHoursId?: number
}) {
    const [integrationsToOverride, setIntegrationsToOverride] = useState<
        number[]
    >([])

    const toggleIntegrationsToOverride = (
        integrations: IntegrationWithBusinessHoursAndStore[],
        selected: boolean,
    ) => {
        const integrationsWithOtherBusinessHours = integrations.filter(
            (integration) =>
                !!integration.business_hours?.id &&
                integration.business_hours?.id !== businessHoursId,
        )

        if (integrationsWithOtherBusinessHours.length === 0) {
            return
        }

        const overridesSet = new Set(integrationsToOverride)

        integrationsWithOtherBusinessHours.forEach((integration) => {
            if (selected) {
                overridesSet.add(integration.integration_id)
            } else {
                overridesSet.delete(integration.integration_id)
            }
        })

        setIntegrationsToOverride(Array.from(overridesSet))
    }

    const resetIntegrationsToOverride = () => {
        setIntegrationsToOverride([])
    }

    return (
        <CustomBusinessHoursContext.Provider
            value={{
                businessHoursId,
                integrationsToOverride,
                toggleIntegrationsToOverride,
                resetIntegrationsToOverride,
            }}
        >
            {children}
        </CustomBusinessHoursContext.Provider>
    )
}
