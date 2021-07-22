import {RavenOptions} from 'raven-js'

import {isDevelopment, isProduction, isStaging} from './environment'

export function reportError(error: Error, options?: RavenOptions) {
    if (isDevelopment() || isStaging()) {
        console.error(error)
        if (options?.extra) {
            console.error('Error extra:', options.extra)
        }
    }
    if (isStaging() || isProduction()) {
        window.Raven?.captureException(error, options)
    }
}
