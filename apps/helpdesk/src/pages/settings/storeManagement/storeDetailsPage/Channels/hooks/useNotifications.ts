import { toast } from '@gorgias/axiom'

import type { ChannelChange, ChannelWithMetadata } from '../../../types'
import { getIntegrationLabels } from '../helpers/getIntegrationLabels'

interface NotificationError {
    channelId: number
}

export const useNotifications = (channels: ChannelWithMetadata[]) => {
    const handleMappingResults = (
        errors: NotificationError[],
        changes: ChannelChange[],
    ) => {
        if (errors.length === 0) {
            toast.success('Changes are saved to this store.')
            return
        }

        if (errors.length === changes.length) {
            toast.error('We couldn’t save your changes. Please try again.')
            return
        }

        const failedChannelIds = errors.map((error) => error.channelId)
        const integrationNames = getIntegrationLabels(
            channels,
            failedChannelIds,
        )
        toast.warning(
            `Most integrations were updated, except for: ${integrationNames}. Check your settings and try again.`,
        )
    }

    return {
        handleMappingResults,
    }
}
