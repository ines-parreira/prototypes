import {
    convertStatusLimitReachedNotInstalled,
    convertStatusOkWarning,
} from 'fixtures/convert'

import {isExceedingPlanLimit} from '../isExceedingPlanLimit'

describe('isExceedingPlanLimit', () => {
    it.each([
        [convertStatusOkWarning, true],
        [
            {
                ...convertStatusOkWarning,
                estimated_reach_date: '2023-04-01T00:00:00.000Z',
            },
            false,
        ],
        [convertStatusLimitReachedNotInstalled, false],
    ])(
        'should determine if the user is exceeding the plan usage',
        (input, expectValue) => {
            expect(isExceedingPlanLimit(input)).toEqual(expectValue)
        }
    )
})
