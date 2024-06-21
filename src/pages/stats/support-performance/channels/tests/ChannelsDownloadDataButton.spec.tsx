import {render, screen} from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import {useChannelsTableSetting} from 'hooks/reporting/useChannelsTableConfigSetting'
import {logEvent, SegmentEvent} from 'common/segment'
import {useChannelsReportMetrics} from 'hooks/reporting/useChannelsReportMetrics'
import {ChannelsDownloadDataButton} from 'pages/stats/support-performance/channels/ChannelsDownloadDataButton'
import {columnsOrder} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {assumeMock} from 'utils/testing'
import * as channelsReportingService from 'services/reporting/channelsReportingService'

jest.mock('hooks/reporting/useChannelsReportMetrics')
const useChannelsReportMetricsMock = assumeMock(useChannelsReportMetrics)

jest.mock('hooks/reporting/useChannelsTableConfigSetting')
const useChannelsTableSettingMock = assumeMock(useChannelsTableSetting)

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('ChannelsDownloadDataButton', () => {
    const reportData = {} as any
    const isLoading = false
    const period = {
        start_datetime: '2021-04-02T00:00:00.000Z',
        end_datetime: '2021-04-02T23:59:59.999Z',
    }
    const columnsOrderFromConfig = [...columnsOrder]

    beforeEach(() => {
        useChannelsReportMetricsMock.mockReturnValue({
            reportData,
            isLoading,
            period,
        })
        useChannelsTableSettingMock.mockReturnValue({
            columnsOrder: columnsOrderFromConfig,
        } as any)
    })

    it('should fetch data and allow calling the csv with report and report the click', () => {
        const reportServiceSpy = jest
            .spyOn(channelsReportingService, 'saveReport')
            .mockReturnValue({} as any)

        render(<ChannelsDownloadDataButton />)
        userEvent.click(screen.getByRole('button'))

        expect(reportServiceSpy).toHaveBeenCalledWith(
            reportData,
            columnsOrder,
            period
        )
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            })
        )
    })
})
