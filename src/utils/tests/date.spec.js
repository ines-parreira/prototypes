//@flow
// bypassing mocked values in setup.js
const {getMomentTimezoneNames} = jest.requireActual('../date')

describe('date utils', () => {
    describe('getMomentTimezoneNames', () => {
        it('should return timezone names', () => {
            expect(getMomentTimezoneNames()).toMatchSnapshot()
        })
    })
})
