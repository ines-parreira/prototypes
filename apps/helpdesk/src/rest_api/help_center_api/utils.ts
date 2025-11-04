import { isProduction, isStaging } from '@repo/utils'

export function getHelpCenterApiBaseUrl(): string {
    // Use helpdesk's host
    if (isStaging()) {
        return 'https://acme.gorgias.xyz'
    }
    if (isProduction()) {
        return 'https://internal-help-center-api.gorgias.com'
    }

    return 'http://acme.gorgias.docker:4001'
}
