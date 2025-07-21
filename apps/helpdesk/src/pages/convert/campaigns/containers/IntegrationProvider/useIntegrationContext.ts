import { useContext } from 'react'

import IntegrationContext from './context'

export function useIntegrationContext() {
    return useContext(IntegrationContext)
}
