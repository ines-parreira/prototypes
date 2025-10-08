import { logger } from 'utils/datadog'

export function reportQueryMismatch(metric: string, diff: string) {
    logger.warn('Query mismatch', {
        metric,
        diff,
        timestamp: new Date().toISOString(),
    })
}
