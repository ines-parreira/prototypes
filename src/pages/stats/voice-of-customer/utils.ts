import { isUsLanguage } from 'pages/stats/utils'
import { formatDatetime } from 'utils'
import { SHORT_DATE_WITH_YEAR_US, SHORT_DATE_WITH_YEAR_WORLD } from 'utils/date'

const getDateFormat = () =>
    isUsLanguage() ? SHORT_DATE_WITH_YEAR_US : SHORT_DATE_WITH_YEAR_WORLD

export const formatDateRange = (
    startDate: string,
    endDate: string,
    timezone: string,
) => {
    const format = getDateFormat()

    return [
        formatDatetime(startDate, format, timezone),
        formatDatetime(endDate, format, timezone),
    ].join(' - ')
}
