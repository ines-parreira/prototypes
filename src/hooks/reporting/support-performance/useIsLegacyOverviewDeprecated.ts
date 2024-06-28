import moment from 'moment-timezone'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'

const TIMEZONE_FALLBACK = 'US/Pacific'
export const LEGACY_OVERVIEW_DEPRECATION_DATE = '2024-06-30T23:59:59.000Z'

export const useIsLegacyOverviewDeprecated = () => {
    const usersTimezone = useAppSelector(getTimezone) ?? TIMEZONE_FALLBACK
    const now = moment.tz(usersTimezone)
    const deprecationDate = moment.tz(
        LEGACY_OVERVIEW_DEPRECATION_DATE,
        'YYYY-MM-DDTHH:mm:ss',
        TIMEZONE_FALLBACK
    )

    return now.isAfter(deprecationDate)
}
