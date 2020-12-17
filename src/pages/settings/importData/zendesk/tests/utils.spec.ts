import {fromJS} from 'immutable'

import {getImportCompletionDate} from '../utils'

import {failedImport, pendingImport, successImport} from './fixtures'

describe('utils', () => {
    describe('getImportCompletionDate()', () => {
        it.each([
            [successImport, 'Completed on 27/11/2020 6:19 PM'],
            [failedImport, 'Last updated on 27/10/2020 6:19 PM'],
            [pendingImport, 'Started on 26/09/2020 6:19 PM'],
        ])(
            'should return proper string depending on the status',
            (integration, expectedString) => {
                expect(getImportCompletionDate(fromJS(integration))).toEqual(
                    expectedString
                )
            }
        )
    })
})
