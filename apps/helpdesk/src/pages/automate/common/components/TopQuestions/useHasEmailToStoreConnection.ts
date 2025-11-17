import { useMemo } from 'react'

import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import { useListStoreMappings } from 'models/storeMapping/queries'
import type { StoreMapping } from 'models/storeMapping/types'
import { isGenericEmailIntegration } from 'pages/integrations/integration/components/email/helpers'
import * as integrationsSelectors from 'state/integrations/selectors'

export const useHasEmailToStoreConnection = (storeIntegrationId?: number) => {
    const integrations = useAppSelector(
        integrationsSelectors.getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES),
    )

    const emailIntegrations = useMemo(
        () => integrations.filter(isGenericEmailIntegration),
        [integrations],
    )
    const emailIntegrationIds = useMemo(
        () => emailIntegrations.map((emailIntegration) => emailIntegration.id),
        [emailIntegrations],
    )
    const { data: storeMappings, isLoading } = useListStoreMappings(
        emailIntegrationIds,
        {
            refetchOnWindowFocus: false,
        },
    )

    const hasEmailToStoreConnection = useMemo(
        () =>
            storeMappings?.some(
                (mapping: StoreMapping) =>
                    mapping.store_id === storeIntegrationId,
            ),
        [storeIntegrationId, storeMappings],
    )

    return {
        isLoading,
        hasEmailToStoreConnection: hasEmailToStoreConnection === true,
    }
}
