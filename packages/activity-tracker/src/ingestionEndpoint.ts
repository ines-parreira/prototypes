import { isDevelopment } from '@repo/utils'

type ActivityTrackerIngestionEndpointConfig = {
    cluster: string
    hostname: string
    isDevelopment: boolean
}

const PREVIEW_NAMESPACE_PATTERN = /^(pr-\d+)\.preview\.gorgias\./

export const getActivityTrackerIngestionEndpoint = ({
    cluster,
    hostname,
    isDevelopment,
}: ActivityTrackerIngestionEndpointConfig) => {
    if (isDevelopment) {
        return 'http://localhost:8076/private/track'
    }

    const previewNamespace = PREVIEW_NAMESPACE_PATTERN.exec(hostname)?.[1]

    if (previewNamespace) {
        return `https://${previewNamespace}-events-ingestion.preview.gorgias.xyz/private/track`
    }

    const gorgiasDomainExtension = hostname.split('.').pop()!

    return `https://${cluster}.events-ingestion-helpdesk.services.gorgias.${gorgiasDomainExtension}/private/track`
}

export const getBrowserActivityTrackerIngestionEndpoint = () =>
    getActivityTrackerIngestionEndpoint({
        cluster: window.GORGIAS_CLUSTER,
        hostname: window.location.hostname,
        isDevelopment: isDevelopment(),
    })
