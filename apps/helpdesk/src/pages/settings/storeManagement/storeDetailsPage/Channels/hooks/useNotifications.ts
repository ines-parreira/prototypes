import { useNotify } from 'hooks/useNotify'

import { ChannelChange, ChannelWithMetadata } from '../../../types'
import { getIntegrationLabels } from '../helpers/getIntegrationLabels'

interface NotificationError {
    channelId: number
}

export const useNotifications = (channels: ChannelWithMetadata[]) => {
    const { success, error, warning } = useNotify()

    const handleMappingResults = (
        errors: NotificationError[],
        changes: ChannelChange[],
    ) => {
        if (errors.length === 0) {
            success('Changes are saved to this store.')
            return
        }

        if (errors.length === changes.length) {
            error('We couldn’t save your changes. Please try again.')
            return
        }

        const failedChannelIds = errors.map((error) => error.channelId)
        const integrationNames = getIntegrationLabels(
            channels,
            failedChannelIds,
        )
        warning(
            `Most integrations were updated, except for: ${integrationNames}. Check your settings and try again.`,
        )
    }

    return {
        handleMappingResults,
    }
}
