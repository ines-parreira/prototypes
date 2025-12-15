import { formatDatetime } from '@repo/utils'

import {
    LegacyBadge as Badge,
    Icon,
    LegacyLoadingSpinner as LoadingSpinner,
} from '@gorgias/axiom'
import type { Integration } from '@gorgias/helpdesk-types'

import { ImportStatus } from './types'

type MapStatusReturn = {
    status: string
    isSynchronizing: boolean
    updatedDatetime?: string
    importedTicketsPercentage?: number
}

export const mapStatus = (integration: Integration): MapStatusReturn => {
    const { meta, updated_datetime } = integration

    const importStatus = meta.status

    if (importStatus === ImportStatus.Success) {
        const synchronizationEnabled = !!meta.continuous_import_enabled

        return {
            status: 'Completed',
            isSynchronizing: synchronizationEnabled,
            updatedDatetime: formatDatetime(
                updated_datetime ?? '',
                'MM/DD/YYYY hh:mm A',
                'Europe/Paris',
            ).toString(),
        }
    } else if (
        importStatus === ImportStatus.Pending ||
        importStatus === ImportStatus.RateLimitExceededBackoff
    ) {
        return {
            status: 'in-progress',
            isSynchronizing: false,
            updatedDatetime: formatDatetime(
                updated_datetime ?? '',
                'MM/DD/YYYY hh:mm A',
                'Europe/Paris',
            ).toString(),
        }
    }

    return {
        status: 'Unknown',
        isSynchronizing: false,
        updatedDatetime: formatDatetime(
            updated_datetime ?? '',
            'MM/DD/YYYY hh:mm A',
            'Europe/Paris',
        ).toString(),
    }
}

export const mapSyncBtn = (isSynchronizing: boolean) => {
    if (isSynchronizing) {
        return (
            <Badge corner="square" type="light-dark">
                <LoadingSpinner size="small" />
                Synchronizing
            </Badge>
        )
    }
    return (
        <Badge corner="square" type="dark">
            <Icon name="media-pause-circle" />
            Paused
        </Badge>
    )
}
