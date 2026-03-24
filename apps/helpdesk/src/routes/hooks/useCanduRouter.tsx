import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'

export type CanduRouter = {
    /**
     * Routes to a Candu callback URL.
     *
     * Candu does not support parameters in callback functions, so we use a URL
     * as an "event name" and decode it to decide how to respond. For more info,
     * see the notion page on Candu
     *
     * @param url - The Candu URL to route to (e.g., "candu://growth/path")
     */
    route: (url: string) => void
}

const prefix = 'candu://'

const teamMapping: Map<string, SentryTeam> = new Map([
    ['growth', SentryTeam.CRM_GROWTH],
])

/**
 * Hook to facilitate routing functionality from Candu.
 *
 * Candu does not support parameters in callback functions, so this router
 * accepts URLs as "event names" and decodes them to determine the appropriate response.
 *
 * @returns A CanduRouter object with a route method for handling Candu callbacks
 */
export const useCanduRouter = (): CanduRouter => {
    return {
        route: (url: string) => {
            const parsed = parseCanduRoute(url)
            if (parsed === undefined) {
                return
            }

            router(parsed)
        },
    }
}

export function parseCanduRoute(url: string): URL | undefined {
    try {
        if (!url.startsWith(prefix)) {
            return new URL(prefix + url)
        }
        return new URL(url)
    } catch (error) {
        reportError(error, {
            tags: {},
            extra: {
                url,
            },
        })
    }

    return undefined
}

function router(url: URL) {
    const { hostname, pathname, searchParams } = url
    const team = teamMapping.get(hostname)

    try {
        switch (hostname) {
            case 'growth':
                growthRouter(pathname, searchParams)
                break
            default:
                throw new Error('unknown hostname')
        }
    } catch (error) {
        reportError(error, {
            tags: {
                team,
            },
            extra: {
                hostname,
                pathname,
                searchParams,
            },
        })
    }
}

function growthParsePlanUUID(searchParams: URLSearchParams): string {
    const planUUID = searchParams.get('planUUID')
    if (planUUID === null) {
        throw new Error('plan not defined')
    }

    return planUUID
}

function growthParseSkipStartDialog(searchParams: URLSearchParams): boolean {
    const skipStartDialogParam = searchParams
        .get('skipStartDialog')
        ?.toLocaleLowerCase()
    return skipStartDialogParam === 'true'
}

function growthRouter(pathname: string, searchParams: URLSearchParams) {
    switch (pathname) {
        case '/obi/activate':
            window.ObiSDK?.('update', { isActive: true })
            break
        case '/obi/deactivate':
            window.ObiSDK?.('update', { isActive: false })
            break
        case '/obi/startSession':
            {
                const planUUID = growthParsePlanUUID(searchParams)
                const skipStartDialog = growthParseSkipStartDialog(searchParams)

                window.ObiSDK?.('startSession', {
                    planUuid: planUUID,
                    skipStartDialog: skipStartDialog,
                })
            }
            break
        case '/obi/stopSession':
            window.ObiSDK?.('stopSession')
            break
        case '/obi/activateAndStartSession':
            {
                const planUUID = growthParsePlanUUID(searchParams)
                const skipStartDialog = growthParseSkipStartDialog(searchParams)

                window.ObiSDK?.('update', { isActive: true })
                window.ObiSDK?.('startSession', {
                    planUuid: planUUID,
                    skipStartDialog: skipStartDialog,
                })
            }
            break
        default:
            throw new Error('unknown path')
    }
}
