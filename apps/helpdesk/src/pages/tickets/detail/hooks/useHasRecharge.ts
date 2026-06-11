import { IntegrationType } from '@gorgias/helpdesk-types'

import { useHasIntegration } from './useHasIntegration'

export function useHasRecharge() {
    return useHasIntegration(IntegrationType.Recharge)
}
