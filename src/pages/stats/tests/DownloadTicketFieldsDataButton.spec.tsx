import React from 'react'
import {render, screen, fireEvent, act} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {UseQueryResult} from '@tanstack/react-query'

import {logEvent, SegmentEvent} from 'common/segment'
import {assumeMock} from 'utils/testing'
import {saveReport} from 'services/reporting/ticketFieldsReportingService'
import {OrderDirection} from 'models/api/types'
import {
    DownloadTicketFieldsDataButton,
    DOWNLOAD_DATA_BUTTON_LABEL,
} from 'pages/stats/DownloadTicketFieldsDataButton'
import {useCustomFieldsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'
import {formatDates} from 'pages/stats/utils'
import {ReportingGranularity} from 'models/reporting/types'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {RootState} from 'state/types'
import {initialState} from 'state/stats/reducers'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {
    ticketInsightsSlice,
    getCustomFieldsOrder,
} from 'state/ui/stats/ticketInsightsSlice'

jest.mock('services/reporting/ticketFieldsReportingService')
jest.mock('hooks/reporting/timeSeries')
const useCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    useCustomFieldsTicketCountTimeSeries
)
jest.mock('state/ui/stats/ticketInsightsSlice')
const getCustomFieldOrderMock = assumeMock(getCustomFieldsOrder)

const saveReportMock = assumeMock(saveReport)
jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

const mockStore = configureMockStore([thunk])

describe('DownloadTicketFieldsDataButton', () => {
    const period = {
        start_datetime: '2021-02-03T00:00:00.000Z',
        end_datetime: '2021-02-03T23:59:59.999Z',
    }
    const selectedCustomFieldId = 2
    const granularity = ReportingGranularity.Day
    const defaultState = {
        stats: fromJS({
            ...initialState,
            filters: {
                period,
            },
        }),
        ui: {
            [ticketInsightsSlice.name]: {
                selectedCustomField: {id: selectedCustomFieldId},
            },
            stats: uiStatsInitialState,
        },
        period,
    } as unknown as RootState

    const store = mockStore(defaultState)

    const defaultOrder = {
        direction: OrderDirection.Desc,
        column: 'label' as const,
    }
    const dateTimes = ['2021-02-03T00:00:00.000Z']
    const data: Record<string, TimeSeriesDataItem[][]> = {
        'Level1::Level2': [
            [
                {
                    dateTime: '2021-02-03T00:00:00.000Z',
                    value: 10,
                },
            ],
        ],
    }

    beforeEach(() => {
        useCustomFieldsTicketCountTimeSeriesMock.mockReturnValue({
            data,
            isLoading: false,
        } as UseQueryResult<Record<string, TimeSeriesDataItem[][]>>)

        getCustomFieldOrderMock.mockReturnValue(defaultOrder)
    })

    it('should render', () => {
        render(
            <Provider store={store}>
                <DownloadTicketFieldsDataButton
                    selectedCustomFieldId={selectedCustomFieldId}
                />
            </Provider>
        )

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should call saveReport on click', () => {
        render(
            <Provider store={store}>
                <DownloadTicketFieldsDataButton
                    selectedCustomFieldId={selectedCustomFieldId}
                />
            </Provider>
        )

        fireEvent.click(screen.getByRole('button'))
        expect(saveReportMock).toHaveBeenCalledWith(
            data,
            dateTimes.map((date) => formatDates(granularity, date)),
            period,
            OrderDirection.Desc
        )
    })

    it('should be disabled', () => {
        useCustomFieldsTicketCountTimeSeriesMock.mockReturnValue({
            data,
            isLoading: true,
        } as any)
        render(
            <Provider store={store}>
                <DownloadTicketFieldsDataButton
                    selectedCustomFieldId={selectedCustomFieldId}
                />
            </Provider>
        )

        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should send event to segment and call saveReport on download data button click', () => {
        const {getByText} = render(
            <Provider store={store}>
                <DownloadTicketFieldsDataButton
                    selectedCustomFieldId={selectedCustomFieldId}
                />
            </Provider>
        )
        act(() => {
            fireEvent.click(getByText(DOWNLOAD_DATA_BUTTON_LABEL))
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            })
        )
        expect(saveReportMock).toHaveBeenCalled()
    })
})
