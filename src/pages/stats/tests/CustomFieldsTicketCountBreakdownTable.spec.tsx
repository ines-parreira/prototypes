import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {useCustomFieldsTicketCountPerCustomFields} from 'hooks/reporting/useCustomFieldsTicketCountPerCustomFields'
import {OrderDirection} from 'models/api/types'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    CUSTOM_FIELD_COLUMN_LABEL,
    CustomFieldsTicketCountBreakdownTable,
    TOTAL_COLUMN_LABEL,
} from 'pages/stats/CustomFieldsTicketCountBreakdownTable'
import {RootState, StoreDispatch} from 'state/types'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'
import {assumeMock} from 'utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('hooks/reporting/useCustomFieldsTicketCountPerCustomFields')
const useCustomFieldsTicketCountPerCustomFieldsMock = assumeMock(
    useCustomFieldsTicketCountPerCustomFields
)

jest.mock('state/ui/stats/agentPerformanceSlice')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone
)

describe('<CustomFieldsTicketCountBreakdownTable />', () => {
    const defaultStatsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00+02:00',
            end_datetime: '2021-06-04T23:59:59+02:00',
        },
    }
    const defaultState = {
        stats: fromJS({
            filters: defaultStatsFilters,
        }),
    } as unknown as RootState
    const exampleData = [
        {
            'TicketCustomFields.ticketCount': 668,
            'TicketCustomFields.valueString': 'abc',
            children: [
                {
                    'TicketCustomFields.ticketCount': 668,
                    'TicketCustomFields.valueString': 'xyz',
                    children: [],
                    timeSeries: [
                        {
                            dateTime: '2021-05-01T00:00:00+02:00',
                            value: 456,
                        },
                        {
                            dateTime: '2021-05-02T00:00:00+02:00',
                            value: 123,
                        },
                        {
                            dateTime: '2021-05-04T23:59:59+02:00',
                            value: 89,
                        },
                    ],
                },
            ],
            timeSeries: [
                {
                    dateTime: '2021-05-01T00:00:00+02:00',
                    value: 456,
                },
                {
                    dateTime: '2021-05-02T00:00:00+02:00',
                    value: 123,
                },
                {
                    dateTime: '2021-05-04T23:59:59+02:00',
                    value: 89,
                },
            ],
        },
    ]

    getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
        userTimezone: 'someTimezone',
        cleanStatsFilters: defaultStatsFilters,
        granularity: ReportingGranularity.Day,
    })
    useCustomFieldsTicketCountPerCustomFieldsMock.mockReturnValue({
        data: exampleData,
        dateTimes: [],
        order: OrderDirection.Asc,
        isLoading: false,
    })

    it('should render the title', () => {
        const customFieldId = 123

        render(
            <Provider store={mockStore(defaultState)}>
                <CustomFieldsTicketCountBreakdownTable
                    selectedCustomFieldId={customFieldId}
                />
            </Provider>
        )

        expect(screen.getByText(TOTAL_COLUMN_LABEL)).toBeInTheDocument()
        expect(screen.getByText(CUSTOM_FIELD_COLUMN_LABEL)).toBeInTheDocument()
    })
})
