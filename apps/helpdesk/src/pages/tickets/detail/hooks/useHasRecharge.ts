import { IntegrationType } from '@gorgias/helpdesk-types'

import useHasIntegration from './useHasIntegration'

export default function useHasRecharge() {
    return useHasIntegration(IntegrationType.Recharge)
}
