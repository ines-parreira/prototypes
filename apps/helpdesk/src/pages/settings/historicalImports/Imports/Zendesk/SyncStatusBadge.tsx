import { useState } from 'react'

import {
    LegacyBadge as Badge,
    Box,
    Icon,
    LegacyLoadingSpinner as LoadingSpinner,
    Text,
} from '@gorgias/axiom'
import { useUpdateIntegration } from '@gorgias/helpdesk-queries'
import type { HttpResponse, Integration } from '@gorgias/helpdesk-types'

import { mapStatus } from './utils'

type SyncStatusBadgeProps = {
    integrationItem: Integration
}

export const SyncStatusBadge = ({ integrationItem }: SyncStatusBadgeProps) => {
    const { isSynchronizing } = integrationItem
        ? mapStatus(integrationItem)
        : { isSynchronizing: false }

    const [syncInProgress, setSyncInProgress] = useState(isSynchronizing)

    const connectMutationOptions = {
        onSuccess: (response: HttpResponse<Integration>) => {
            const { isSynchronizing } = mapStatus(response?.data)

            setSyncInProgress(isSynchronizing)
        },
        onError: (error: HttpResponse<unknown>) => {
            console.error(error)
        },
    }

    const { mutate: performUpdate, isLoading: isUpdating } =
        useUpdateIntegration({
            mutation: connectMutationOptions,
        })

    if (!integrationItem) return null

    const update = () =>
        performUpdate({
            id: integrationItem.id,
            data: {
                id: integrationItem.id,
                meta: {
                    continuous_import_enabled: !syncInProgress,
                },
            } as any,
        })

    return (
        <Badge onClick={update} corner="square" type="dark">
            {syncInProgress || isUpdating ? (
                <>
                    <LoadingSpinner size="small" />
                    <Text size="sm">Synchronizing</Text>
                </>
            ) : (
                <Box
                    alignItems="center"
                    justifyContent="center"
                    width="100%"
                    gap="xs"
                >
                    <Icon name="media-pause-circle" size="sm" />
                    <Text size="sm">Paused</Text>
                </Box>
            )}
        </Badge>
    )
}
