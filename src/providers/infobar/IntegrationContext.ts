import {fromJS, Map} from 'immutable'
import {createContext} from 'react'

export type IntegrationContextType = {
    integration: Map<string, unknown>
    integrationId: number | null
}

export const IntegrationContext = createContext<IntegrationContextType>({
    integration: fromJS({}),
    integrationId: null,
})
