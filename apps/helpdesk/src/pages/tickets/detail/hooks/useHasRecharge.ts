import { IntegrationType } from '@gorgias/helpdesk-queries'

import useHasIntegration from './useHasIntegration'

export default function useHasRecharge() {
    return useHasIntegration(IntegrationType.Recharge)
}
