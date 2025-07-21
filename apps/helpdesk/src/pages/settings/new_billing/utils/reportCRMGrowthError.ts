import { SentryTeam } from 'common/const/sentryTeamNames'
import { reportError } from 'utils/errors'

export const reportCRMGrowthError = (error: unknown, context: string) => {
    reportError(error, {
        tags: { team: SentryTeam.CRM_GROWTH },
        extra: {
            context,
        },
    })
}
