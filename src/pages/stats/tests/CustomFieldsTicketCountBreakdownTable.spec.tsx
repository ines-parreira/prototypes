import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'

import {useCustomFieldsTicketCountPerCustomFields} from 'hooks/reporting/useCustomFieldsTicketCountPerCustomFields'
import {getPeriodDateTimes} from 'hooks/reporting/useTimeSeries'
import {BREAKDOWN_FIELD, VALUE_FIELD} from 'hooks/reporting/withBreakdown'
import {OrderDirection} from 'models/api/types'
import {ReportingGranularity} from 'models/reporting/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {
    CUSTOM_FIELD_COLUMN_LABEL,
    CUSTOM_FIELDS_PER_PAGE,
    CustomFieldsTicketCountBreakdownTable,
    TOTAL_COLUMN_LABEL,
} from 'pages/stats/CustomFieldsTicketCountBreakdownTable'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'
import {RootState, StoreDispatch} from 'state/types'

import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {
    initialState,
    setOrder,
    ticketInsightsSlice,
} from 'state/ui/stats/ticketInsightsSlice'
import {getFilterDateRange} from 'utils/reporting'
import {assumeMock} from 'utils/testing'
import {formatDates} from 'pages/stats/utils'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('hooks/reporting/useCustomFieldsTicketCountPerCustomFields')
const useCustomFieldsTicketCountPerCustomFieldsMock = assumeMock(
    useCustomFieldsTicketCountPerCustomFields
)
jest.mock('state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone
)
jest.mock('pages/stats/NoDataAvailable')
const NoDataAvailableMock = assumeMock(NoDataAvailable)

jest.mock('@gorgias/ui-kit', () => ({
    Tooltip: () => <div />,
}))

const componentMock = () => <div />

describe('<CustomFieldsTicketCountBreakdownTable />', () => {
    const customField = {id: 123, label: 'someLabel'}
    const defaultStatsFilters: LegacyStatsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00+02:00',
            end_datetime: '2021-05-30T23:59:59+02:00',
        },
    }
    const defaultState = {
        stats: {
            filters: defaultStatsFilters,
        },
        ui: {
            [ticketInsightsSlice.name]: initialState,
        },
    } as unknown as RootState
    const exampleData = [
        {
            [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 668,
            [TicketCustomFieldsDimension.TicketCustomFieldsValueString]: 'abc',
            initialCustomFieldValue: ['abc::xyz'],
            decile: 9,
            totalsDecile: 7,
            percentage: 100,
            children: [
                {
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 668,
                    [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                        'xyz',
                    initialCustomFieldValue: null,
                    decile: 9,
                    totalsDecile: 7,
                    percentage: 100,
                    children: [],
                    timeSeries: [
                        {
                            dateTime: '2021-05-01T00:00:00+02:00',
                            value: 456,
                            decile: 9,
                            totalsDecile: 7,
                            percentage: 100,
                        },
                        {
                            dateTime: '2021-05-02T00:00:00+02:00',
                            value: 123,
                            decile: 9,
                            totalsDecile: 7,
                            percentage: 100,
                        },
                        {
                            dateTime: '2021-05-04T23:59:59+02:00',
                            value: 89,
                            decile: 9,
                            totalsDecile: 7,
                            percentage: 100,
                        },
                    ],
                },
            ],
            timeSeries: [
                {
                    dateTime: '2021-05-01T00:00:00+02:00',
                    value: 456,
                    decile: 9,
                    totalsDecile: 7,
                    percentage: 100,
                },
                {
                    dateTime: '2021-05-02T00:00:00+02:00',
                    value: 123,
                    decile: 9,
                    totalsDecile: 7,
                    percentage: 100,
                },
                {
                    dateTime: '2021-05-04T23:59:59+02:00',
                    value: 89,
                    decile: 9,
                    totalsDecile: 7,
                    percentage: 100,
                },
            ],
        },
    ]

    const dateTimes = [
        '2021-05-01T00:00:00+02:00',
        '2021-05-02T00:00:00+02:00',
        '2021-05-04T23:59:59+02:00',
    ]

    beforeEach(() => {
        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            userTimezone: 'someTimezone',
            cleanStatsFilters: defaultStatsFilters,
            granularity: ReportingGranularity.Day,
        })
        useCustomFieldsTicketCountPerCustomFieldsMock.mockReturnValue({
            data: exampleData,
            dateTimes,
            order: {column: 'label', direction: OrderDirection.Asc},
            isLoading: false,
        })
        NoDataAvailableMock.mockImplementation(componentMock)
    })

    it('should render the title', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <CustomFieldsTicketCountBreakdownTable
                    selectedCustomField={customField}
                />
            </Provider>
        )

        expect(screen.getByText(TOTAL_COLUMN_LABEL)).toBeInTheDocument()
        expect(screen.getByText(CUSTOM_FIELD_COLUMN_LABEL)).toBeInTheDocument()
    })

    it('should render NoData component when no data available', () => {
        useCustomFieldsTicketCountPerCustomFieldsMock.mockReturnValue({
            data: [],
            dateTimes: [],
            order: {column: 'label', direction: OrderDirection.Asc},
            isLoading: false,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <CustomFieldsTicketCountBreakdownTable
                    selectedCustomField={customField}
                />
            </Provider>
        )

        expect(NoDataAvailableMock).toHaveBeenCalled()
    })

    it('should trigger ordering action when category label clicked', () => {
        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <CustomFieldsTicketCountBreakdownTable
                    selectedCustomField={customField}
                />
            </Provider>
        )
        act(() => {
            const categoryLabel = screen.getByText(CUSTOM_FIELD_COLUMN_LABEL)
            userEvent.click(categoryLabel)
        })

        expect(store.getActions()).toContainEqual(setOrder({column: 'label'}))
    })

    it('should trigger ordering action when category label clicked', () => {
        const store = mockStore(defaultState)
        useCustomFieldsTicketCountPerCustomFieldsMock.mockReturnValue({
            data: exampleData,
            dateTimes,
            order: {column: 0, direction: OrderDirection.Desc},
            isLoading: false,
        })

        render(
            <Provider store={store}>
                <CustomFieldsTicketCountBreakdownTable
                    selectedCustomField={customField}
                />
            </Provider>
        )
        act(() => {
            const categoryLabel = screen.getByText(TOTAL_COLUMN_LABEL)
            userEvent.click(categoryLabel)
        })

        expect(store.getActions()).toContainEqual(setOrder({column: 'total'}))
    })

    it('should trigger ordering action when data label clicked', () => {
        const dataPoint = {
            [BREAKDOWN_FIELD]: 'abc',
            [VALUE_FIELD]: 2,
            initialCustomFieldValue: ['abc'],
            timeSeries: [
                {
                    dateTime: '2021-05-29T23:59:59+02:00',
                    value: 2,
                    label: '2021-05-29T23:59:59+02:00',
                    percentage: 100,
                    decile: 9,
                    totalsDecile: 8,
                },
            ],
            percentage: 100,
            decile: 9,
            totalsDecile: 8,
            children: [],
        }

        const granularity = ReportingGranularity.Day
        useCustomFieldsTicketCountPerCustomFieldsMock.mockReturnValue({
            data: [dataPoint],
            dateTimes: getPeriodDateTimes(
                getFilterDateRange(defaultStatsFilters.period),
                granularity
            ),
            order: {column: 'label', direction: OrderDirection.Asc},
            isLoading: false,
        })
        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <CustomFieldsTicketCountBreakdownTable
                    selectedCustomField={customField}
                />
            </Provider>
        )
        act(() => {
            const categoryLabel = screen.getByText(
                formatDates(granularity, dataPoint.timeSeries[0].label)
            )
            userEvent.click(categoryLabel)
        })

        expect(store.getActions()).toContainEqual(setOrder({column: 0}))
    })

    it('should handle table scrolling', async () => {
        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <CustomFieldsTicketCountBreakdownTable
                    selectedCustomField={customField}
                />
            </Provider>
        )
        act(() => {
            const tableRow = document.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, {target: {scrollLeft: 50}})
        })

        await waitFor(() => {
            expect(
                screen.getByRole('cell', {
                    name: new RegExp(CUSTOM_FIELD_COLUMN_LABEL),
                })
            ).toHaveClass('withShadow')
        })

        act(() => {
            const tableRow = document.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, {target: {scrollLeft: 0}})
        })

        await waitFor(() => {
            expect(
                screen.getByRole('cell', {
                    name: new RegExp(CUSTOM_FIELD_COLUMN_LABEL),
                })
            ).not.toHaveClass('withShadow')
        })
    })

    it('should render loading skeletons when loading in progress', () => {
        useCustomFieldsTicketCountPerCustomFieldsMock.mockReturnValue({
            data: [],
            dateTimes,
            order: {column: 'label', direction: OrderDirection.Asc},
            isLoading: true,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <CustomFieldsTicketCountBreakdownTable
                    selectedCustomField={customField}
                />
            </Provider>
        )

        expect(document.querySelector('.skeleton')).toBeInTheDocument()
    })

    describe('Pagination', () => {
        it(`should render pagination when more then ${CUSTOM_FIELDS_PER_PAGE} top level Custom Fields available`, () => {
            useCustomFieldsTicketCountPerCustomFieldsMock.mockReturnValue({
                data: Array(CUSTOM_FIELDS_PER_PAGE + 5).fill(exampleData[0]),
                dateTimes,
                order: {column: 'label', direction: OrderDirection.Asc},
                isLoading: false,
            })

            render(
                <Provider store={mockStore(defaultState)}>
                    <CustomFieldsTicketCountBreakdownTable
                        selectedCustomField={customField}
                    />
                </Provider>
            )

            expect(screen.getAllByRole('rowgroup')[1].children.length).toEqual(
                CUSTOM_FIELDS_PER_PAGE
            )
        })

        it('should allow switching pages', async () => {
            const SECOND_PAGE_ITEMS_COUNT = 5
            useCustomFieldsTicketCountPerCustomFieldsMock.mockReturnValue({
                data: Array(
                    CUSTOM_FIELDS_PER_PAGE + SECOND_PAGE_ITEMS_COUNT
                ).fill(exampleData[0]),
                dateTimes,
                order: {column: 'label', direction: OrderDirection.Asc},
                isLoading: false,
            })

            render(
                <Provider store={mockStore(defaultState)}>
                    <CustomFieldsTicketCountBreakdownTable
                        selectedCustomField={customField}
                    />
                </Provider>
            )
            act(() => {
                const pageButton = screen.getByText('2')
                userEvent.click(pageButton)
            })

            await waitFor(() => {
                expect(
                    screen.getAllByRole('rowgroup')[1].children.length
                ).toEqual(SECOND_PAGE_ITEMS_COUNT)
            })
        })

        it('should reset to page 1 when number of data rows changes', async () => {
            const SECOND_PAGE_ITEMS_COUNT = 5
            useCustomFieldsTicketCountPerCustomFieldsMock.mockReturnValue({
                data: Array(
                    CUSTOM_FIELDS_PER_PAGE + SECOND_PAGE_ITEMS_COUNT
                ).fill(exampleData[0]),
                dateTimes,
                order: {column: 'label', direction: OrderDirection.Asc},
                isLoading: false,
            })

            const {rerender} = render(
                <Provider store={mockStore(defaultState)}>
                    <CustomFieldsTicketCountBreakdownTable
                        selectedCustomField={customField}
                    />
                </Provider>
            )
            act(() => {
                const pageButton = screen.getByText('2')
                userEvent.click(pageButton)
            })

            expect(
                screen.getByRole('listitem', {name: 'page-2'})
            ).toBeInTheDocument()

            useCustomFieldsTicketCountPerCustomFieldsMock.mockReturnValue({
                data: Array(CUSTOM_FIELDS_PER_PAGE - 1).fill(exampleData[0]),
                dateTimes,
                order: {column: 'label', direction: OrderDirection.Asc},
                isLoading: false,
            })
            rerender(
                <Provider store={mockStore(defaultState)}>
                    <CustomFieldsTicketCountBreakdownTable
                        selectedCustomField={customField}
                    />
                </Provider>
            )

            await waitFor(() => {
                expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
            })
        })
    })
})
