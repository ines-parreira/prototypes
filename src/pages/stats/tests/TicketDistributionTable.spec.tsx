import {render, screen} from '@testing-library/react'

import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {
    OUTSIDE_TOP_DATA,
    TicketDistributionTable,
} from 'pages/stats/TicketDistributionTable'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'
import {useTicketsDistribution} from '../useTicketsDistribution'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('pages/stats/useTicketsDistribution')
const useTicketsDistributionMock = assumeMock(useTicketsDistribution)

describe('<TicketDistributionTable>', () => {
    const maxTicketCount = 16
    const data = [
        {
            [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                'Level 0',
            [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '4',
        },
        {
            [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                'Level 0::Level 1',
            [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                String(maxTicketCount),
        },
    ]

    const useTicketsDistributionReturnValue: ReturnType<
        typeof useTicketsDistribution
    > = {
        topData: data.map((item) => ({
            category:
                item[TicketCustomFieldsDimension.TicketCustomFieldsValueString],
            value: Number(
                item[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]
            ),
            valueInPercentage:
                (100 *
                    Number(
                        item[
                            TicketCustomFieldsMeasure
                                .TicketCustomFieldsTicketCount
                        ]
                    )) /
                maxTicketCount,
        })),
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
            <Provider store={mockStore({})}>
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
            <Provider store={mockStore({})}>
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
            <Provider store={mockStore({})}>
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
            <Provider store={mockStore({})}>
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
            <Provider store={mockStore({})}>
                <TicketDistributionTable />
            </Provider>
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(screen.getAllByTestId(MOCK_SKELETON_TEST_ID).length).not.toBe(0)
    })
})
