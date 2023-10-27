import React from 'react'
import {render, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {UseQueryResult} from '@tanstack/react-query'

import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {
    initialState as ticketInsightsState,
    ticketInsightsSlice,
} from 'state/ui/stats/ticketInsightsSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import useAppSelector from 'hooks/useAppSelector'
import SupportPerformanceTicketInsights, {
    TICKET_INSIGHTS_PAGE_TITLE,
} from 'pages/stats/SupportPerformanceTicketInsights'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {CustomFieldSelect} from 'pages/stats/CustomFieldSelect'
import {TicketDistributionTable} from 'pages/stats/TicketDistributionTable'
import {TicketInsightsFieldTrend} from 'pages/stats/TicketInsightsFieldTrend'
import {TicketFieldsBlankState} from 'pages/stats/TicketFieldsBlankState'
import {DownloadTicketFieldsDataButton} from 'pages/stats/DownloadTicketFieldsDataButton'

import {ApiListResponseCursorPagination} from 'models/api/types'
import {CustomField} from 'models/customField/types'
import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import {assumeMock} from 'utils/testing'
import {CustomFieldsTicketCountBreakdownReport} from '../CustomFieldsTicketCountBreakdownReport'

jest.mock('pages/stats/SupportPerformanceFilters.tsx')
const SupportPerformanceFiltersMock = assumeMock(SupportPerformanceFilters)

jest.mock('pages/stats/CustomFieldSelect.tsx')
const CustomFieldSelectMock = assumeMock(CustomFieldSelect)

jest.mock('pages/stats/TicketDistributionTable.tsx')
const TicketDistributionTableMock = assumeMock(TicketDistributionTable)
jest.mock('pages/stats/TicketInsightsFieldTrend.tsx')
const TicketInsightsFieldTrendMock = assumeMock(TicketInsightsFieldTrend)
jest.mock('pages/stats/DownloadTicketFieldsDataButton.tsx')
const DownloadTicketFieldsDataButtonMock = assumeMock(
    DownloadTicketFieldsDataButton
)
jest.mock('pages/stats/TicketFieldsBlankState.tsx')
const TicketFieldsBlankStateMock = assumeMock(TicketFieldsBlankState)
jest.mock('hooks/customField/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)
jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock('pages/stats/CustomFieldsTicketCountBreakdownReport.tsx')
const CustomFieldsTicketCountBreakdownReportMock = assumeMock(
    CustomFieldsTicketCountBreakdownReport
)
const componentMock = () => <div />

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<SupportPerformanceTicketInsights />', () => {
    const defaultState = {
        stats: initialState,
        ui: {
            [ticketInsightsSlice.name]: ticketInsightsState,
            stats: uiStatsInitialState,
        },
    } as unknown as RootState

    const useCustomFieldDefinitionsMockReturnValue = {
        data: {data: []},
        isLoading: false,
    } as unknown as UseQueryResult<
        ApiListResponseCursorPagination<CustomField[]>
    >

    useCustomFieldDefinitionsMock.mockReturnValue(
        useCustomFieldDefinitionsMockReturnValue
    )
    useAppSelectorMock.mockReturnValue({id: 1})

    beforeEach(() => {
        SupportPerformanceFiltersMock.mockImplementation(componentMock)
        CustomFieldSelectMock.mockImplementation(componentMock)
        TicketDistributionTableMock.mockImplementation(componentMock)
        TicketInsightsFieldTrendMock.mockImplementation(componentMock)
        CustomFieldsTicketCountBreakdownReportMock.mockImplementation(
            componentMock
        )
        TicketFieldsBlankStateMock.mockImplementation(componentMock)
        DownloadTicketFieldsDataButtonMock.mockImplementation(componentMock)
    })

    it('should render the page title', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>
        )
        const title = screen.getByText(TICKET_INSIGHTS_PAGE_TITLE)

        expect(title).toBeInTheDocument()
    })

    it('should render the Filters', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>
        )

        expect(SupportPerformanceFiltersMock).toHaveBeenCalled()
    })

    it('should render the CustomFieldSelect', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>
        )

        expect(CustomFieldSelectMock).toHaveBeenCalled()
    })

    it('should render the TicketDistributionTable', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>
        )

        expect(TicketDistributionTableMock).toHaveBeenCalled()
    })

    it('should render the TicketInsightsFieldTrend', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>
        )

        expect(TicketInsightsFieldTrendMock).toHaveBeenCalled()
    })

    it('should render the TicketFieldsBlankStateMock', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            ...useCustomFieldDefinitionsMockReturnValue,
            isLoading: false,
        } as unknown as UseQueryResult<ApiListResponseCursorPagination<CustomField[]>>)
        useAppSelectorMock.mockReturnValue({id: null, isLoading: false})

        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>
        )

        expect(TicketFieldsBlankStateMock).toHaveBeenCalled()
    })

    it('should render only the CustomFieldSelect', () => {
        useAppSelectorMock.mockReturnValue({id: null, isLoading: false})

        useCustomFieldDefinitionsMock.mockReturnValue({
            ...useCustomFieldDefinitionsMockReturnValue,
            isLoading: true,
        } as unknown as UseQueryResult<ApiListResponseCursorPagination<CustomField[]>>)

        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>
        )

        expect(TicketDistributionTableMock).not.toHaveBeenCalled()
        expect(TicketInsightsFieldTrendMock).not.toHaveBeenCalled()
    })

    it('should render the CustomFieldsTicketCountBreakdownReport', () => {
        render(<CustomFieldsTicketCountBreakdownReport />)

        expect(CustomFieldsTicketCountBreakdownReportMock).toHaveBeenCalled()
    })
})
