import type { StoreMapping } from 'models/storeMapping/types'

export const integrationIsAlreadyMapped = (
    integrationId: number,
    storeMappings: StoreMapping[],
): boolean =>
    storeMappings.some((mapping) => mapping.integration_id === integrationId)

export const isConnectionGettingCreated = (
    currentShopIntegrationId: number | null,
    newShopIntegrationId: number | null,
): boolean => currentShopIntegrationId == null && newShopIntegrationId != null

export const isConnectionGettingUpdated = (
    currentShopIntegrationId: number | null,
    newShopIntegrationId: number | null,
): boolean => currentShopIntegrationId != null && newShopIntegrationId != null

export const isConnectionGettingDeleted = (
    currentShopIntegrationId: number | null,
    newShopIntegrationId: number | null,
): boolean => currentShopIntegrationId != null && newShopIntegrationId == null
