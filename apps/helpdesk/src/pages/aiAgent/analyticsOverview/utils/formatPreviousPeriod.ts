import moment from 'moment'

import type { Period } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

import { DATE_FORMAT } from '../constants'

export const formatPreviousPeriod = (period?: Period): string => {
    if (!period) {
        return ''
    }

    const previousPeriod = getPreviousPeriod(period)

    if (!previousPeriod) {
        return ''
    }

    return `${moment(previousPeriod.start_datetime).format(DATE_FORMAT)} - ${moment(previousPeriod.end_datetime).format(DATE_FORMAT)}`
}
