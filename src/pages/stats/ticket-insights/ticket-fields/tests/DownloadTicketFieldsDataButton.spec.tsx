import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { logEvent, SegmentEvent } from 'common/segment'
import { OrderDirection } from 'models/api/types'
import { ReportingGranularity } from 'models/reporting/types'
import { DOWNLOAD_DATA_BUTTON_LABEL } from 'pages/stats/constants'
import { DownloadTicketFieldsDataButton } from 'pages/stats/ticket-insights/ticket-fields/DownloadTicketFieldsDataButton'
import { useCustomFieldsReportData } from 'services/reporting/ticketFieldsReportingService'
import { initialState } from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import { initialState as uiFiltersInitialState } from 'state/ui/stats/filtersSlice'
import {
    getCustomFieldsOrder,
    ticketInsightsSlice,
} from 'state/ui/stats/ticketInsightsSlice'
import { saveZippedFiles } from 'utils/file'
import { assumeMock } from 'utils/testing'

jest.mock('services/reporting/ticketFieldsReportingService')
const useCustomFieldsReportDataMock = assumeMock(useCustomFieldsReportData)

jest.mock('state/ui/stats/ticketInsightsSlice')
const getCustomFieldOrderMock = assumeMock(getCustomFieldsOrder)

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)
jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)

const mockStore = configureMockStore([thunk])

describe('DownloadTicketFieldsDataButton', () => {
    const period = {
        start_datetime: '2021-02-03T00:00:00.000Z',
        end_datetime: '2021-02-03T23:59:59.999Z',
    }
    const userTimezone = 'UTC'
    const selectedCustomFieldId = 2
    const granularity = ReportingGranularity.Day
    const statsFilters = {
        period,
    }
    const defaultState = {
        stats: {
            ...initialState,
            filters: statsFilters,
        },
        ui: {
            [ticketInsightsSlice.name]: {
                selectedCustomField: { id: selectedCustomFieldId },
            },
            stats: {
                filters: uiFiltersInitialState,
            },
        },
    } as unknown as RootState

    const store = mockStore(defaultState)

    const defaultOrder = {
        direction: OrderDirection.Desc,
        column: 'label' as const,
    }
    const fileName = 'someFileName'

    beforeEach(() => {
        useCustomFieldsReportDataMock.mockReturnValue({
            files: {},
            fileName,
            isLoading: false,
        })

        getCustomFieldOrderMock.mockReturnValue(defaultOrder)
    })

    it('should render', () => {
        render(
            <Provider store={store}>
                <DownloadTicketFieldsDataButton
                    selectedCustomFieldId={selectedCustomFieldId}
                />
            </Provider>,
        )

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should call saveZippedFiles on click', () => {
        render(
            <Provider store={store}>
                <DownloadTicketFieldsDataButton
                    selectedCustomFieldId={selectedCustomFieldId}
                />
            </Provider>,
        )
        fireEvent.click(screen.getByRole('button'))

        expect(useCustomFieldsReportDataMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
            granularity,
            defaultOrder,
            String(selectedCustomFieldId),
        )
        expect(saveZippedFilesMock).toHaveBeenCalledWith({}, fileName)
    })

    it('should be disabled', () => {
        useCustomFieldsReportDataMock.mockReturnValue({
            files: {},
            fileName,
            isLoading: true,
        })
        render(
            <Provider store={store}>
                <DownloadTicketFieldsDataButton
                    selectedCustomFieldId={selectedCustomFieldId}
                />
            </Provider>,
        )

        expect(screen.getByRole('button')).toBeAriaDisabled()
    })

    it('should send event to segment and call saveReport on download data button click', () => {
        const { getByText } = render(
            <Provider store={store}>
                <DownloadTicketFieldsDataButton
                    selectedCustomFieldId={selectedCustomFieldId}
                />
            </Provider>,
        )
        act(() => {
            fireEvent.click(getByText(DOWNLOAD_DATA_BUTTON_LABEL))
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            }),
        )
        expect(useCustomFieldsReportDataMock).toHaveBeenCalled()
    })
})
