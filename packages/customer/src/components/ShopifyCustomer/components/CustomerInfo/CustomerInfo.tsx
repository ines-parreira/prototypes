import { Box } from '@gorgias/axiom'

import { useIntegrationSelection } from '../../hooks'
import { useGetShopper } from '../../hooks/useGetShopper'
import { CustomerLink } from '../CustomerLink'
import { StorePicker } from '../StorePicker'

type Props = {
    associatedShopifyCustomerIds: Set<number>
    externalIdMap: Map<number, string>
    isLoadingTicket?: boolean
    onStoreChange?: (integrationId: number) => void
}

export function CustomerInfo({
    associatedShopifyCustomerIds,
    externalIdMap,
    isLoadingTicket,
    onStoreChange,
}: Props) {
    const {
        filteredIntegrations,
        selectedIntegration,
        selectedExternalId,
        handleStoreChange,
        isLoading: isLoadingIntegrations,
    } = useIntegrationSelection({
        associatedShopifyCustomerIds,
        externalIdMap,
        onStoreChange,
    })

    const { shopper } = useGetShopper({
        integrationId: selectedIntegration?.id,
        externalId: selectedExternalId,
    })

    return (
        <Box flexDirection="column" gap="sm" padding={'sm'}>
            <StorePicker
                integrations={filteredIntegrations}
                selectedIntegrationId={selectedIntegration?.id}
                onChange={handleStoreChange}
                isLoading={isLoadingIntegrations || isLoadingTicket}
            />

            <CustomerLink
                selectedIntegration={selectedIntegration}
                shopper={shopper}
                isLoading={isLoadingIntegrations}
            />
        </Box>
    )
}
