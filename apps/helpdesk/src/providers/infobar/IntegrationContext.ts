import { createContext } from 'react'

import type { Map } from 'immutable'
import { fromJS } from 'immutable'

export type IntegrationContextType = {
    integration: Map<string, unknown>
    integrationId: number | null
}

export const IntegrationContext = createContext<IntegrationContextType>({
    integration: fromJS({}),
    integrationId: null,
})
