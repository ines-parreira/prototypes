import {createContext} from 'react'
import {fromJS, Map} from 'immutable'

export type IntegrationContextType = {
    integration: Map<string, unknown>
    integrationId: number | null
}

export const IntegrationContext = createContext<IntegrationContextType>({
    integration: fromJS({}),
    integrationId: null,
})
