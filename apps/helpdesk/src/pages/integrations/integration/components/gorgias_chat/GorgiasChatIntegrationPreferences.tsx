import type { ComponentProps } from 'react'

import GorgiasChatIntegrationPreferencesLegacy from './legacy/GorgiasChatIntegrationPreferences/GorgiasChatIntegrationPreferences'

type Props = ComponentProps<typeof GorgiasChatIntegrationPreferencesLegacy>

export const GorgiasChatIntegrationPreferences = (props: Props) => {
    return <GorgiasChatIntegrationPreferencesLegacy {...props} />
}
