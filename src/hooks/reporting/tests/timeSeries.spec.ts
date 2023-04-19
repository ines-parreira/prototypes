import {renderHook} from '@testing-library/react-hooks'

import {TicketChannel} from 'business/types/ticket'
import {ReportingGranularity} from 'models/reporting/types'
import {assumeMock} from 'utils/testing'

import {
    useTicketsCreatedTimeSeries,
    useTicketsClosedTimeSeries,
    useMessagesSentTimeSeries,
    useTicketsRepliedTimeSeries,
} from '../timeSeries'
import useTimeSeries from '../useTimeSeries'

jest.mock('../useTimeSeries')
const useTimeSeriesMock = assumeMock(useTimeSeries)

describe('time series', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe.each([
        ['useTicketsCreatedTimeSeries', useTicketsCreatedTimeSeries],
        ['useTicketsClosedTimeSeries', useTicketsClosedTimeSeries],
        ['useMessagesSentTimeSeries', useMessagesSentTimeSeries],
        ['useTicketsRepliedTimeSeries', useTicketsRepliedTimeSeries],
    ])('%s', (testName, useTrendFn) => {
        it('should create reporting filters', () => {
            renderHook(() =>
                useTrendFn(
                    {
                        period: {
                            start_datetime: '2021-05-29T00:00:00+02:00',
                            end_datetime: '2021-06-04T23:59:59+02:00',
                        },
                        channels: [TicketChannel.Email, TicketChannel.Chat],
                        integrations: [1],
                        agents: [2],
                        tags: [1, 2],
                    },
                    'America/Los_angeles',
                    ReportingGranularity.Week
                )
            )
            expect(useTimeSeriesMock.mock.calls[0]).toMatchSnapshot()
        })
    })
})
