import moment from 'moment'
import * as files from 'utils/file'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {saveReport} from 'services/reporting/ticketFieldsReportingService'

jest.mock('utils/file')

describe('ticketFieldsReportingService', () => {
    const dateSeries: Parameters<typeof saveReport>[1] = ['2023-06-07']
    const data: Parameters<typeof saveReport>[0] = {
        'Level1::Level2': [
            [
                {
                    dateTime: dateSeries[0],
                    value: 10,
                },
            ],
        ],
    }

    const period = {
        start_datetime: '2023-06-07',
        end_datetime: '2023-06-14',
    }

    it('should call saveReport with a report', async () => {
        const fakeReport = 'someValue'
        jest.spyOn(files, 'createCsv').mockReturnValue(fakeReport)
        const zipperMock = jest.spyOn(files, 'saveZippedFiles')

        await saveReport(data, dateSeries, period)

        expect(zipperMock).toHaveBeenCalledWith(
            {
                [`${period.start_datetime}_${
                    period.end_datetime
                }-ticket-fields-${moment().format(DATE_TIME_FORMAT)}.csv`]:
                    fakeReport,
            },
            `${period.start_datetime}_${
                period.end_datetime
            }-ticket-fields-${moment().format(DATE_TIME_FORMAT)}`
        )
    })
})
