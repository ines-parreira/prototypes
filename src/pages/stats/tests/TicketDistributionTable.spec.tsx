import React from 'react'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    TicketDistributionTable,
    OUTSIDE_TOP_DATA,
} from 'pages/stats/TicketDistributionTable'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {ticketInsightsSlice} from 'state/ui/stats/ticketInsightsSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {useTicketsDistribution} from '../useTicketsDistribution'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('pages/stats/useTicketsDistribution')
const useTicketsDistributionMock = assumeMock(useTicketsDistribution)

describe('<TicketDistributionTable>', () => {
    const defaultState = {
        stats: initialState,
        ui: {
            [ticketInsightsSlice.name]: {
                selectedCustomFieldId: 2,
            },
            stats: uiStatsInitialState,
        },
    } as unknown as RootState

    const data = [
        {
            [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                'Level 0',
            [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '5',
        },
        {
            [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                'Level 0::Level 1',
            [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '15',
        },
    ]

    const useTicketsDistributionReturnValue: ReturnType<
        typeof useTicketsDistribution
    > = {
        topData: data,
        outsideTopTotal: 0,
        outsideTopTotalPercentage: 0,
        ticketsCountTotal: 20,
        isFetching: false,
    }

    useTicketsDistributionMock.mockReturnValue(
        useTicketsDistributionReturnValue
    )

    it('should render the table', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketDistributionTable />
            </Provider>
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(
            screen.getByText(
                data[0][
                    TicketCustomFieldsDimension.TicketCustomFieldsValueString
                ]
            )
        ).toBeInTheDocument()
    })

    it('should render the total value', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketDistributionTable />
            </Provider>
        )

        expect(
            screen.getByText(
                useTicketsDistributionReturnValue.ticketsCountTotal
            )
        ).toBeInTheDocument()
    })

    it('should render the outside top values', () => {
        useTicketsDistributionMock.mockReturnValue({
            ...useTicketsDistributionReturnValue,
            outsideTopTotal: 10,
            outsideTopTotalPercentage: 50,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketDistributionTable />
            </Provider>
        )

        expect(screen.getByText(OUTSIDE_TOP_DATA.title)).toBeInTheDocument()
        expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('should render no data', () => {
        useTicketsDistributionMock.mockReturnValue({
            ...useTicketsDistributionReturnValue,
            topData: [],
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <TicketDistributionTable />
            </Provider>
        )

        expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('should render the table with skeletons on loading', () => {
        useTicketsDistributionMock.mockReturnValue({
            ...useTicketsDistributionReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketDistributionTable />
            </Provider>
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(screen.getAllByTestId(MOCK_SKELETON_TEST_ID).length).not.toBe(0)
    })
})
