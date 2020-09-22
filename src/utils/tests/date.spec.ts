// bypassing mocked values in setup.js
import {getMomentTimezoneNames} from '../date'

const {
    getMomentTimezoneNames: getMomentTimezoneNamesActual,
} = jest.requireActual('../date')

describe('date utils', () => {
    describe('getMomentTimezoneNames', () => {
        it('should return timezone names', () => {
            expect(
                (getMomentTimezoneNamesActual as typeof getMomentTimezoneNames)()
            ).toMatchSnapshot()
        })
    })
})
