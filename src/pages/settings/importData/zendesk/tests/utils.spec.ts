import {fromJS} from 'immutable'

import {getImportCompletionDate} from '../utils'

import {
    failedImport,
    pendingImport,
    successImport,
    timezoneUtc,
    timezoneParis,
} from './fixtures'

describe('utils', () => {
    describe('getImportCompletionDate()', () => {
        it.each([
            [successImport, timezoneUtc, 'Completed on 11/27/2020 6:19 PM'],
            [failedImport, timezoneUtc, 'Last updated on 10/27/2020 6:19 PM'],
            [pendingImport, timezoneUtc, 'Started on 09/26/2020 6:19 PM'],
            [pendingImport, timezoneParis, 'Started on 09/26/2020 8:19 PM'],
        ])(
            'should return proper string depending on the status',
            (integration, timezone, expectedString) => {
                expect(
                    getImportCompletionDate(fromJS(integration), timezone)
                ).toEqual(expectedString)
            }
        )
    })
})
