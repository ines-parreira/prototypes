import { useUserDateTimePreferences } from '@repo/tickets'

import { Box } from '@gorgias/axiom'

import { useIntegrationSelection } from '../../hooks'
import { useGetPurchaseSummary } from '../../hooks/useGetPurchaseSummary'
import { useGetShopper } from '../../hooks/useGetShopper'
import { CustomerLink } from '../CustomerLink'
import { StorePicker } from '../StorePicker'
import { CustomerInfoFieldList } from './CustomerInfoFieldList'
import { ShopifyTags } from './ShopifyTags'
import type { FieldRenderContext } from './types'
import { useCustomerFieldPreferences } from './useCustomerFieldPreferences'

type Props = {
    associatedShopifyCustomerIds: Set<number>
    externalIdMap: Map<number, string>
    isLoadingTicket?: boolean
    onStoreChange?: (integrationId: number) => void
    ticketId?: string
    customerId?: number
}

export function CustomerInfo({
    associatedShopifyCustomerIds,
    externalIdMap,
    isLoadingTicket,
    onStoreChange,
    ticketId,
    customerId,
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

    const { purchaseSummary } = useGetPurchaseSummary({
        integrationId: selectedIntegration?.id,
        externalId: selectedExternalId,
    })

    const { dateFormat, timeFormat } = useUserDateTimePreferences()

    const context: FieldRenderContext = {
        purchaseSummary,
        shopper,
        dateFormat,
        timeFormat,
        integrationId: selectedIntegration?.id,
        externalId: selectedExternalId,
    }

    const hasData = !!purchaseSummary || !!shopper

    const { fields } = useCustomerFieldPreferences()

    return (
        <Box flexDirection="column" gap="sm" padding="sm">
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
            {hasData && (
                <>
                    <ShopifyTags
                        tags={shopper?.data?.tags}
                        integrationId={selectedIntegration?.id}
                        externalId={selectedExternalId}
                        customerId={customerId}
                        ticketId={ticketId}
                    />
                    <CustomerInfoFieldList fields={fields} context={context} />
                </>
            )}
        </Box>
    )
}
