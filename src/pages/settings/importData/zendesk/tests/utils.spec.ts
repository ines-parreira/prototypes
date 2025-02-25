import {
    DateAndTimeFormatting,
    DateFormatType,
    TimeFormatType,
} from 'constants/datetime'
import { getDateAndTimeFormat } from 'utils/datetime'

import { getImportCompletionDate } from '../utils'
import {
    failedImport,
    pendingImport,
    successImport,
    timezoneParis,
    timezoneUtc,
} from './fixtures'

describe('utils', () => {
    const compactDatetimeFormat = getDateAndTimeFormat(
        DateFormatType.en_US,
        TimeFormatType.AmPm,
        DateAndTimeFormatting.CompactDateWithTime,
    )
    describe('getImportCompletionDate()', () => {
        it.each([
            [successImport, timezoneUtc, 'Completed on 11/27/2020 06:19 PM'],
            [failedImport, timezoneUtc, 'Last updated on 10/27/2020 06:19 PM'],
            [pendingImport, timezoneUtc, 'Started on 09/26/2020 06:19 PM'],
            [pendingImport, timezoneParis, 'Started on 09/26/2020 08:19 PM'],
        ])(
            'should return proper string depending on the status',
            (integration, timezone, expectedString) => {
                expect(
                    getImportCompletionDate(
                        integration,
                        compactDatetimeFormat,
                        timezone,
                    ),
                ).toEqual(expectedString)
            },
        )
    })
})
