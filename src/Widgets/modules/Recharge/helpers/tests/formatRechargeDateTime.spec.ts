import {formatRechargeDateTime} from '../formatRechargeDateTime'

describe('formatRechargeDateTime', () => {
    it('should return an empty string if dateTime is not valid', () => {
        const dateTime = 'invalid date'
        expect(formatRechargeDateTime(dateTime)).toEqual('')
    })

    it('should return a formatted date time', () => {
        const dateTime = '2021-06-01T00:00:00Z'
        expect(formatRechargeDateTime(dateTime)).toEqual(
            '2021-06-01T00:00:00.000-04:00'
        )
    })
})
