import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import { useListStoreMappings } from 'models/storeMapping/queries'
import {
    getIntegrationsByTypes,
    getShopifyIntegrationsSortedByName,
} from 'state/integrations/selectors'

export const usePreselectedEmails = ({
    storeId,
    onboardingEmailIntegrationIds,
}: {
    storeId: number
    onboardingEmailIntegrationIds: number[] | undefined
}): number[] => {
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)
    const isMultiStore = storeIntegrations.length > 1

    const emailIntegrations = useAppSelector(
        getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES),
    )

    const { data: storeEmailIntegrations } = useListStoreMappings(
        emailIntegrations.map((integration) => integration.id),
        {
            enabled:
                !onboardingEmailIntegrationIds &&
                isMultiStore &&
                emailIntegrations.length > 0,
            refetchOnWindowFocus: false,
            select: (storeMappings) =>
                storeMappings
                    .filter((storeMapping) => storeMapping.store_id === storeId)
                    .map((storeMapping) => storeMapping.integration_id),
        },
    )

    if (onboardingEmailIntegrationIds) {
        return onboardingEmailIntegrationIds
    }

    if (isMultiStore) {
        return storeEmailIntegrations ?? []
    }

    return emailIntegrations.map((it) => it.id)
}
