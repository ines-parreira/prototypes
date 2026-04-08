import { isProduction, isStaging } from '@repo/utils'

export function getHelpCenterApiBaseUrl(): string {
    // Use helpdesk's host
    if (isStaging()) {
        return 'https://help-center-api.gorgias.rehab'
    }
    if (isProduction()) {
        return 'https://help-center-api.gorgias.help'
    }

    return 'http://acme.gorgias.docker:4001'
}
