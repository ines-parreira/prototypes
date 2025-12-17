import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import useAppSelector from 'hooks/useAppSelector'
import type { HttpIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { AVAILABLE_3PL_INTEGRATIONS } from 'pages/automate/workflows/models/variables.types'
import { getIntegrations } from 'state/integrations/selectors'

type ValidIntegration = HttpIntegration & {
    application_id: (typeof AVAILABLE_3PL_INTEGRATIONS)[number]
}

export default function useThreeplIntegrations() {
    const are3plObjectsEnabled = useFlag(FeatureFlagKey.Actions3plObjects)
    const integrations = useAppSelector(getIntegrations)

    const availableIntegrations = useMemo(
        () =>
            integrations
                ?.filter<ValidIntegration>(
                    (integration): integration is ValidIntegration =>
                        !!(
                            integration.application_id &&
                            AVAILABLE_3PL_INTEGRATIONS.includes(
                                integration.application_id as (typeof AVAILABLE_3PL_INTEGRATIONS)[number],
                            ) &&
                            integration.type === IntegrationType.Http &&
                            !integration.deleted_datetime &&
                            !integration.deactivated_datetime
                        ),
                )
                .map((integration) => ({
                    integration_id: integration.id,
                    application_id: integration.application_id,
                })),
        [integrations],
    )

    return are3plObjectsEnabled ? availableIntegrations : []
}
