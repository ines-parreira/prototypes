import { useState } from 'react'

import {
    LegacyBadge as Badge,
    Icon,
    LegacyLoadingSpinner as LoadingSpinner,
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

    if (syncInProgress) {
        return (
            <Badge onClick={update} corner="square" type="dark">
                <LoadingSpinner size="small" />
                {!isUpdating && 'Synchronizing'}
            </Badge>
        )
    }
    return (
        <Badge onClick={update} corner="square" type="dark">
            <Icon name="media-pause-circle" />
            {!isUpdating && 'Paused'}
            {isUpdating && <LoadingSpinner size="small" />}
        </Badge>
    )
}
