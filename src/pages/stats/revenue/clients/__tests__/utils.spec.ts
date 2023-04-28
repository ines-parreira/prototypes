import moment from 'moment'
import {getDateRange} from 'pages/stats/revenue/clients/utils'

describe('getDateRange', () => {
    it('should return date range in Cube format and timezone', () => {
        // arrange
        const startDate = '2022-04-01T20:00:00-08:00'
        const endDate = '2022-05-15T06:00:00+08:00'

        // act
        const result = getDateRange(startDate, endDate)

        // assert
        expect(result).toEqual([
            '2022-04-01T08:00:00.000',
            '2022-05-15T15:59:59.999',
        ])
    })

    it('should return date range of the same length as input', () => {
        // arrange
        const startDate = '2022-04-02T11:23:45-08:00'
        const endDate = '2022-04-02T21:23:45-08:00'

        // act
        const [startDateUtc, endDateUtc] = getDateRange(startDate, endDate)

        // assert
        const diff = moment(endDateUtc).diff(moment(startDateUtc))
        expect(diff).toEqual(24 * 60 * 60 * 1000 - 1) // 24 hours minus 1ms
    })
})
