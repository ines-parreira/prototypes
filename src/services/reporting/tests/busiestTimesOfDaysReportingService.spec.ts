import {
    getAggregatedBusiestTimesOfDayData,
    hourFromHourIndex,
} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import * as files from 'utils/file'

import {saveReport} from '../busiestTimesOfDaysReportingService'

jest.mock('utils/file')

describe('saveReport', () => {
    const timeZone = 'America/Los_Angeles'
    const {btodData} = getAggregatedBusiestTimesOfDayData([[]], timeZone)

    it('should render the report', async () => {
        const createCsvMock = jest.spyOn(files, 'createCsv')

        await saveReport(btodData)

        expect(createCsvMock).toHaveBeenCalledWith([
            [
                'HOUR',
                'MONDAY',
                'TUESDAY',
                'WEDNESDAY',
                'THURSDAY',
                'FRIDAY',
                'SATURDAY',
                'SUNDAY',
            ],
            [hourFromHourIndex(0), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(1), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(2), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(3), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(4), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(5), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(6), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(7), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(8), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(9), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(10), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(11), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(12), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(13), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(14), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(15), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(16), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(17), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(18), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(19), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(20), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(21), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(22), 0, 0, 0, 0, 0, 0, 0],
            [hourFromHourIndex(23), 0, 0, 0, 0, 0, 0, 0],
        ])
    })
})
