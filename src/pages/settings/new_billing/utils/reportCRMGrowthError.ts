import {CRM_GROWTH_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {reportError} from 'utils/errors'

export const reportCRMGrowthError = (error: unknown, context: string) => {
    reportError(error, {
        tags: {team: CRM_GROWTH_SENTRY_TEAM},
        extra: {
            context,
        },
    })
}
