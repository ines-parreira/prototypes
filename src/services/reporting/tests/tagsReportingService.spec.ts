import moment from 'moment/moment'

import {tags} from 'fixtures/tag'
import {FormattedDataItem} from 'hooks/reporting/ticket-insights/useTicketCountPerTag'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {saveReport} from 'services/reporting/tagsReportingService'
import * as files from 'utils/file'

jest.mock('utils/file')

describe('TagsReportingService', () => {
    const tag = tags[0]
    const deletedTagId = '789'
    const data: FormattedDataItem[] = [
        {
            tagId: String(tag.id),
            tag,
            timeSeries: [
                {value: 100, dateTime: '2023-06-07'},
                {value: 23, dateTime: '2023-06-08'},
                {
                    value: 0,
                    dateTime: '2023-06-09',
                },
            ],
            total: 123,
        },
        {
            tagId: deletedTagId,
            tag: undefined,
            timeSeries: [
                {value: 200, dateTime: '2023-06-07'},
                {value: 13, dateTime: '2023-06-08'},
                {
                    value: 0,
                    dateTime: '2023-06-09',
                },
            ],
            total: 213,
        },
    ]
    const dateTimes = ['2023-06-07', '2023-06-08', '2023-06-09']
    const period = {
        start_datetime: '2023-06-07',
        end_datetime: '2023-06-09',
    }

    it('should save report ', async () => {
        const expectedData = [
            ['tag', 'total', '2023-06-07', '2023-06-08', '2023-06-09'],
            ['billing', 123, 100, 23, 0],
            [deletedTagId, 213, 200, 13, 0],
        ]
        const csvSpy = jest
            .spyOn(files, 'createCsv')
            .mockReturnValue(JSON.stringify(expectedData))
        const zipperMock = jest.spyOn(files, 'saveZippedFiles')

        await saveReport(data, dateTimes, period)

        expect(csvSpy).toHaveBeenCalledWith(expectedData)
        expect(zipperMock).toHaveBeenCalledWith(
            {
                [`${period.start_datetime}_${
                    period.end_datetime
                }-all-used-tags-${moment().format(DATE_TIME_FORMAT)}.csv`]:
                    JSON.stringify(expectedData),
            },
            `${period.start_datetime}_${
                period.end_datetime
            }-all-used-tags-${moment().format(DATE_TIME_FORMAT)}`
        )
    })
})
