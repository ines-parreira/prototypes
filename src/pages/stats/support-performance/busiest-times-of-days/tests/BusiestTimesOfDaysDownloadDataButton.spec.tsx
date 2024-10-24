import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import * as segment from 'common/segment'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'
import {BusiestTimesOfDaysDownloadDataButton} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysDownloadDataButton'
import {useAggregatedBusiestTimesOfDayData} from 'pages/stats/support-performance/busiest-times-of-days/useAggregatedBusiestTimesOfDayData'
import * as btodService from 'services/reporting/busiestTimesOfDaysReportingService'
import {assumeMock} from 'utils/testing'

jest.mock(
    'pages/stats/support-performance/busiest-times-of-days/useAggregatedBusiestTimesOfDayData'
)
const useAggregatedBusiestTimesOfDayDataMock = assumeMock(
    useAggregatedBusiestTimesOfDayData
)

describe('BusiestTimesOfDaysDownloadDataButton', () => {
    const btodData = {
        btodData: {},
        isLoading: false,
        period: {
            end_datetime: 'string',
            start_datetime: 'string',
        },
    } as any

    beforeEach(() => {
        useAggregatedBusiestTimesOfDayDataMock.mockReturnValue(btodData)
    })

    it('should pass provided query to the data hook', () => {
        const querySpy = jest.fn()

        render(
            <BusiestTimesOfDaysDownloadDataButton useMetricQuery={querySpy} />
        )

        expect(useAggregatedBusiestTimesOfDayDataMock).toHaveBeenCalledWith(
            querySpy
        )
    })

    it('should call logEvent and saveReport on click', () => {
        const querySpy = jest.fn()
        const logEventSpy = jest.spyOn(segment, 'logEvent')
        const saveReportSpy = jest
            .spyOn(btodService, 'saveReport')
            .mockImplementation(jest.fn())

        render(
            <BusiestTimesOfDaysDownloadDataButton useMetricQuery={querySpy} />
        )
        const button = screen.getByText(DOWNLOAD_DATA_BUTTON_LABEL)
        act(() => {
            userEvent.click(button)
        })

        expect(logEventSpy).toHaveBeenCalled()
        expect(saveReportSpy).toHaveBeenCalled()
    })
})
