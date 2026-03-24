import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'

export const reportCRMGrowthError = (error: unknown, context: string) => {
    const errorMessage =
        error instanceof Error
            ? error?.message
            : typeof error === 'string'
              ? error
              : 'Unknown error'

    const formattedError = new Error(`${context}: ${errorMessage}`)

    reportError(formattedError, {
        tags: { team: SentryTeam.CRM_GROWTH },
        extra: {
            context,
            originalError: error,
        },
    })
}
