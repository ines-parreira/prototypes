import moment from 'moment'

import { getDateRange } from 'domains/reporting/pages/convert/clients/utils'

describe('getDateRange', () => {
    it('should return date range in Cube format and without timezone', () => {
        // arrange
        const startDate = '2022-04-01T20:00:00-08:00'
        const endDate = '2022-05-15T06:00:00+08:00'

        // act
        const result = getDateRange(startDate, endDate)

        // assert
        expect(result).toEqual([
            '2022-04-01T20:00:00.000',
            '2022-05-15T06:00:00.000',
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
        expect(diff).toEqual(10 * 60 * 60 * 1000) // 10 hours
    })
})
